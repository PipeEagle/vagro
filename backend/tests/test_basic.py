"""Basic backend regression tests."""

from datetime import date, timedelta
from decimal import Decimal

from app.extensions import bcrypt, db
from app.modules.cosechas.entities.models import Cosecha
from app.modules.cultivos.entities.models import Cultivo
from app.modules.fincas.entities.models import Finca
from app.modules.labores.entities.models import Labor
from app.modules.lotes.entities.models import Lote
from app.modules.usuarios.entities.models import Usuario


def test_app_creates(app):
    """Verify the configured test application is created."""
    assert app is not None
    assert app.config["TESTING"] is True


def test_database_connection(app, client):
    """Verify the isolated test database can be accessed."""
    with app.app_context():
        result = db.session.execute(db.text("SELECT 1")).scalar()
        assert result == 1


def test_unauthenticated_api_returns_json_401(client):
    """Keep protected API requests from redirecting to an HTML login page."""
    response = client.get("/api/usuarios")

    assert response.status_code == 401
    assert response.is_json


def test_finca_creation_rejects_whitespace_required_fields(client):
    """Do not accept whitespace-only values as required farm details."""
    response = client.post(
        "/api/fincas",
        json={"nombre": "   ", "municipio": "Prueba", "departamento": "Prueba"},
    )

    assert response.status_code == 400
    assert "nombre" in response.json["details"]


def test_login_path_uses_the_spa_sign_in_screen(client):
    """Keep the legacy login URL on the single SPA sign-in screen."""
    response = client.get("/login", follow_redirects=True)

    assert response.status_code == 200
    assert b'<div id="app"></div>' in response.data
    assert b"Acceso administrador" not in response.data


def test_admin_login_can_list_users(app, client):
    """Verify a real login session can load the protected user list."""
    with app.app_context():
        db.session.add(
            Usuario(
                username="admin",
                password_hash=bcrypt.generate_password_hash("test-password").decode("utf-8"),
                nombre_completo="Test Admin",
                rol="SUPERADMIN",
                is_active=True,
            )
        )
        db.session.commit()

    login_response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "test-password"},
    )
    users_response = client.get("/api/usuarios")

    assert login_response.status_code == 200
    assert users_response.status_code == 200
    assert users_response.json[0]["username"] == "admin"
    assert users_response.json[0]["estado"] == "Activo"
    assert users_response.json[0]["finca_id"] is None


def test_legacy_admin_dashboard_redirects_to_spa(app, client):
    """Keep the legacy dashboard URL working without Jinja templates."""
    with app.app_context():
        db.session.add(
            Usuario(
                username="admin-dashboard",
                password_hash=bcrypt.generate_password_hash("test-password").decode("utf-8"),
                nombre_completo="Test Admin",
                rol="SUPERADMIN",
                is_active=True,
            )
        )
        db.session.commit()

    client.post(
        "/api/auth/login",
        json={"username": "admin-dashboard", "password": "test-password"},
    )
    response = client.get("/admin/dashboard")

    assert response.status_code == 302
    assert response.headers["Location"].endswith("/dashboard")


def test_mayordomo_session_me_keeps_assigned_farm(app, client):
    """Restore the mayordomo's farm assignment when the SPA reloads."""
    with app.app_context():
        finca = Finca(
            nombre="Finca del mayordomo",
            municipio="Prueba",
            departamento="Prueba",
        )
        db.session.add(finca)
        db.session.flush()
        mayordomo = Usuario(
            username="mayordomo",
            password_hash=bcrypt.generate_password_hash("test-password").decode("utf-8"),
            nombre_completo="Mayordomo de prueba",
            rol="MAYORDOMO",
            finca_id=finca.id,
            is_active=True,
        )
        db.session.add(mayordomo)
        db.session.commit()
        finca_id = finca.id

    login_response = client.post(
        "/api/auth/login",
        json={"username": "mayordomo", "password": "test-password"},
    )
    me_response = client.get("/api/auth/me")

    assert login_response.status_code == 200
    assert login_response.json["user"]["finca_id"] == finca_id
    assert me_response.status_code == 200
    assert me_response.json["user"]["rol"] == "MAYORDOMO"
    assert me_response.json["user"]["finca_id"] == finca_id


def test_create_labor_requires_a_matching_existing_plot(app, client):
    """Persist labor against an existing plot in the selected farm."""
    with app.app_context():
        finca = Finca(
            nombre="Finca de prueba",
            municipio="Prueba",
            departamento="Prueba",
        )
        otra_finca = Finca(
            nombre="Otra finca de prueba",
            municipio="Prueba",
            departamento="Prueba",
        )
        cultivo = Cultivo(nombre="Cafe de prueba")
        db.session.add_all([finca, otra_finca, cultivo])
        db.session.flush()
        lote = Lote(
            finca_id=finca.id,
            cultivo_id=cultivo.id,
            codigo_qr="LOTE-TEST-LABOR",
            nombre="Lote de prueba",
            hectareas=Decimal("1.00"),
        )
        db.session.add(lote)
        db.session.commit()
        finca_id = finca.id
        otra_finca_id = otra_finca.id
        lote_id = lote.id

    payload = {
        "finca_id": finca_id,
        "lote_id": lote_id,
        "tipo": "riego",
        "fecha": "2026-12-01",
        "estado": "Pendiente",
    }
    response = client.post("/api/labores", json=payload)

    assert response.status_code == 201
    assert response.json["lote_id"] == lote_id
    assert response.json["lote_codigo_qr"] == "LOTE-TEST-LABOR"

    missing_plot_payload = {**payload, "finca_id": finca_id}
    missing_plot_payload.pop("lote_id")
    missing_plot_response = client.post("/api/labores", json=missing_plot_payload)

    assert missing_plot_response.status_code == 400

    payload["finca_id"] = otra_finca_id
    mismatch_response = client.post("/api/labores", json=payload)

    assert mismatch_response.status_code == 400
    assert mismatch_response.json["error"] == "El lote no pertenece a la finca seleccionada."


def test_lote_update_persists_changes_and_returns_crop(app, client):
    """Persist plot edits and include the crop needed by the detail view."""
    with app.app_context():
        finca = Finca(
            nombre="Finca de edicion",
            municipio="Prueba",
            departamento="Prueba",
        )
        cultivo_original = Cultivo(nombre="Cafe de edicion")
        cultivo_nuevo = Cultivo(nombre="Platano de edicion")
        db.session.add_all([finca, cultivo_original, cultivo_nuevo])
        db.session.flush()
        lote = Lote(
            finca_id=finca.id,
            cultivo_id=cultivo_original.id,
            codigo_qr="LOTE-TEST-EDICION",
            nombre="Lote sin editar",
            hectareas=Decimal("1.00"),
        )
        db.session.add(lote)
        db.session.commit()
        lote_id = lote.id
        finca_id = finca.id
        cultivo_nuevo_id = cultivo_nuevo.id

    response = client.put(
        f"/api/lotes/{lote_id}",
        json={
            "finca_id": finca_id,
            "cultivo_id": cultivo_nuevo_id,
            "codigo_qr": "LOTE-TEST-EDICION",
            "nombre": "Lote editado",
            "hectareas": 2.5,
            "estado": "EN_DESCANSO",
        },
    )

    assert response.status_code == 200
    assert response.json["nombre"] == "Lote editado"
    assert response.json["cultivo"]["nombre"] == "Platano de edicion"


def test_lote_delete_persists_removal(app, client):
    """Verify a successful plot deletion remains absent from the API."""
    with app.app_context():
        finca = Finca(
            nombre="Finca de eliminacion",
            municipio="Prueba",
            departamento="Prueba",
        )
        cultivo = Cultivo(nombre="Cafe de eliminacion")
        db.session.add_all([finca, cultivo])
        db.session.flush()
        lote = Lote(
            finca_id=finca.id,
            cultivo_id=cultivo.id,
            codigo_qr="LOTE-TEST-ELIMINACION",
            nombre="Lote de eliminacion",
            hectareas=Decimal("1.00"),
        )
        db.session.add(lote)
        db.session.commit()
        lote_id = lote.id

    delete_response = client.delete(f"/api/lotes/{lote_id}")
    get_response = client.get(f"/api/lotes/{lote_id}")

    assert delete_response.status_code == 200
    assert get_response.status_code == 404


def test_lote_delete_rejects_labor_dependencies(app, client):
    """Keep lots with associated labor records and return a clear conflict."""
    with app.app_context():
        db.session.execute(db.text("PRAGMA foreign_keys = ON"))
        finca = Finca(
            nombre="Finca con labor",
            municipio="Prueba",
            departamento="Prueba",
        )
        cultivo = Cultivo(nombre="Cafe con labor")
        db.session.add_all([finca, cultivo])
        db.session.flush()
        lote = Lote(
            finca_id=finca.id,
            cultivo_id=cultivo.id,
            codigo_qr="LOTE-TEST-DEPENDENCIA",
            nombre="Lote con labor",
            hectareas=Decimal("1.00"),
        )
        db.session.add(lote)
        db.session.flush()
        db.session.add(
            Labor(
                finca_id=finca.id,
                lote_id=lote.id,
                tipo="riego",
                fecha=date(2026, 12, 1),
                estado="Pendiente",
            )
        )
        db.session.commit()
        lote_id = lote.id

    response = client.delete(f"/api/lotes/{lote_id}")

    assert response.status_code == 409
    assert "labores asociadas" in response.json["error"]
    assert client.get(f"/api/lotes/{lote_id}").status_code == 200


def test_finca_delete_rejects_plot_dependencies(app, client):
    """Keep farms with associated plots and return a clear conflict."""
    with app.app_context():
        db.session.execute(db.text("PRAGMA foreign_keys = ON"))
        finca = Finca(
            nombre="Finca con lote",
            municipio="Prueba",
            departamento="Prueba",
        )
        cultivo = Cultivo(nombre="Cafe de finca con lote")
        db.session.add_all([finca, cultivo])
        db.session.flush()
        lote = Lote(
            finca_id=finca.id,
            cultivo_id=cultivo.id,
            codigo_qr="LOTE-TEST-FINCA-DEPENDENCIA",
            nombre="Lote de finca",
            hectareas=Decimal("1.00"),
        )
        db.session.add(lote)
        db.session.commit()
        finca_id = finca.id

    response = client.delete(f"/api/fincas/{finca_id}")

    assert response.status_code == 409
    assert "lotes o labores asociadas" in response.json["error"]
    assert client.get(f"/api/fincas/{finca_id}").status_code == 200


def test_insumo_quantity_is_persisted_and_editable(app, client):
    """Persist stock quantity on creation and update, and reject negative stock."""
    with app.app_context():
        finca = Finca(
            nombre="Finca de insumos",
            municipio="Prueba",
            departamento="Prueba",
        )
        db.session.add(finca)
        db.session.commit()
        finca_id = finca.id

    payload = {
        "finca_id": finca_id,
        "nombre": "Fertilizante de prueba",
        "tipo": "fertilizante",
        "ingrediente": "Nitrogeno",
        "carencia": "5 dias",
        "cantidad": 12.5,
        "unidad": "kg",
    }
    create_response = client.post("/api/insumos", json=payload)

    assert create_response.status_code == 201
    insumo_id = create_response.json["id"]
    assert create_response.json["cantidad"] == 12.5

    update_response = client.put(
        f"/api/insumos/{insumo_id}",
        json={**payload, "cantidad": 4.75},
    )
    get_response = client.get(f"/api/insumos/{insumo_id}")

    assert update_response.status_code == 200
    assert update_response.json["cantidad"] == 4.75
    assert get_response.json["cantidad"] == 4.75

    invalid_response = client.post(
        "/api/insumos",
        json={**payload, "nombre": "Insumo con cantidad invalida", "cantidad": -1},
    )

    assert invalid_response.status_code == 400
    assert "cantidad" in invalid_response.json["details"]


def test_cosecha_update_accepts_partial_edit_fields_and_persists_zero(app, client):
    """Allow the detail form's partial payload and persist a quantity of zero."""
    with app.app_context():
        finca = Finca(
            nombre="Finca de cosecha",
            municipio="Prueba",
            departamento="Prueba",
        )
        cultivo = Cultivo(nombre="Cafe de cosecha")
        db.session.add_all([finca, cultivo])
        db.session.flush()
        lote = Lote(
            finca_id=finca.id,
            cultivo_id=cultivo.id,
            codigo_qr="LOTE-TEST-COSECHA-EDIT",
            nombre="Lote de cosecha",
            hectareas=Decimal("1.00"),
        )
        db.session.add(lote)
        cosecha = Cosecha(
            finca_id=finca.id,
            lote_codigo_qr=lote.codigo_qr,
            fecha=date(2026, 11, 28),
            cantidad=4,
            unidad="kg",
            calidad="Primera",
            estado="Pendiente",
        )
        db.session.add(cosecha)
        db.session.commit()
        cosecha_id = cosecha.id

    response = client.put(
        f"/api/cosechas/{cosecha_id}",
        json={"cantidad": 0, "calidad": "Primera", "estado": "Por confirmar"},
    )
    persisted_response = client.get(f"/api/cosechas/{cosecha_id}")

    assert response.status_code == 200
    assert response.json["cantidad"] == 0
    assert response.json["estado"] == "Por confirmar"
    assert persisted_response.json["cantidad"] == 0
    assert persisted_response.json["fecha"] == "2026-11-28"


def test_past_cosechas_are_completed_on_create_and_update(app, client):
    """Past harvests must be completed while today's harvest may remain pending."""
    with app.app_context():
        finca = Finca(
            nombre="Finca con cosechas pasadas",
            municipio="Prueba",
            departamento="Prueba",
        )
        cultivo = Cultivo(nombre="Cafe con cosechas pasadas")
        db.session.add_all([finca, cultivo])
        db.session.flush()
        lote = Lote(
            finca_id=finca.id,
            cultivo_id=cultivo.id,
            codigo_qr="LOTE-TEST-COSECHA-FECHA",
            nombre="Lote con cosechas",
            hectareas=Decimal("1.00"),
        )
        db.session.add(lote)
        db.session.commit()
        finca_id = finca.id
        lote_codigo_qr = lote.codigo_qr

    ayer = (date.today() - timedelta(days=1)).isoformat()
    hoy = date.today().isoformat()
    payload = {
        "finca_id": finca_id,
        "lote_codigo_qr": lote_codigo_qr,
        "cantidad": 5,
        "unidad": "kg",
        "calidad": "Primera",
        "estado": "Pendiente",
    }

    cosecha_pasada = client.post(
        "/api/cosechas",
        json={**payload, "fecha": ayer},
    )
    cosecha_hoy = client.post(
        "/api/cosechas",
        json={**payload, "fecha": hoy},
    )
    actualizacion_pasada = client.put(
        f"/api/cosechas/{cosecha_hoy.json['id']}",
        json={"fecha": ayer, "estado": "Pendiente"},
    )

    assert cosecha_pasada.status_code == 201
    assert cosecha_pasada.json["estado"] == "Completada"
    assert cosecha_hoy.status_code == 201
    assert cosecha_hoy.json["estado"] == "Pendiente"
    assert actualizacion_pasada.status_code == 200
    assert actualizacion_pasada.json["estado"] == "Completada"


def test_future_cosechas_cannot_be_completed_early(app, client):
    """Reject completing future harvests through both create and update APIs."""
    with app.app_context():
        finca = Finca(
            nombre="Finca con cosechas futuras",
            municipio="Prueba",
            departamento="Prueba",
        )
        cultivo = Cultivo(nombre="Cafe con cosechas futuras")
        db.session.add_all([finca, cultivo])
        db.session.flush()
        lote = Lote(
            finca_id=finca.id,
            cultivo_id=cultivo.id,
            codigo_qr="LOTE-TEST-COSECHA-FUTURA",
            nombre="Lote con cosechas futuras",
            hectareas=Decimal("1.00"),
        )
        db.session.add(lote)
        db.session.commit()
        finca_id = finca.id
        lote_codigo_qr = lote.codigo_qr

    fecha_futura = (date.today() + timedelta(days=1)).isoformat()
    payload = {
        "finca_id": finca_id,
        "lote_codigo_qr": lote_codigo_qr,
        "fecha": fecha_futura,
        "cantidad": 5,
        "unidad": "kg",
        "calidad": "Primera",
        "estado": "Pendiente",
    }

    intento_creacion = client.post(
        "/api/cosechas",
        json={**payload, "estado": "Completada"},
    )
    cosecha_futura = client.post("/api/cosechas", json=payload)
    intento_actualizacion = client.put(
        f"/api/cosechas/{cosecha_futura.json['id']}",
        json={"estado": "Completada"},
    )

    assert intento_creacion.status_code == 400
    assert "fecha" in intento_creacion.json["error"]
    assert cosecha_futura.status_code == 201
    assert intento_actualizacion.status_code == 400
    assert client.get(f"/api/cosechas/{cosecha_futura.json['id']}").json["estado"] == "Pendiente"
