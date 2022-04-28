import json
import os

from flask import Flask, request, url_for, render_template, make_response, jsonify
from flask_login import LoginManager, login_manager, login_user, logout_user, login_required, current_user

from werkzeug.utils import redirect
from datetime import timedelta
from data import db_session, api
from data.models import *
from forms.user import *

app = Flask(__name__)

login_manager = LoginManager()
login_manager.init_app(app)

app.config['SECRET_KEY'] = "YGHBJdfDG^Dd7g7gh{}P{OU*&*shb"
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(
    days=365
)


@login_manager.user_loader
def load_user(user_id):
    db_sess = db_session.create_session()
    return db_sess.query(User).get(user_id)


@app.route('/')
@app.route('/index')
def index():
    db_sess = db_session.create_session()
    tests = db_sess.query(Test).all()
    return render_template('index.html', title='Главная', tests=tests)


@app.route('/marks')
def marks():
    tests = None
    db_sess = db_session.create_session()
    if current_user.role == 'student':
        tests = db_sess.query(Passing).filter(Passing.user_id == current_user.id).all()
    elif current_user.role == 'teacher':
        users = list(map(lambda x: x.id, db_sess.query(User).filter(User.teacher_id == current_user.id).all()))
        tests2 = db_sess.query(Passing).all()
        tests = []
        for i in tests2:
            if i.user_id in users:
                tests.append(i)

    elif current_user.role == 'admin':
        tests = db_sess.query(Passing).all()
    return render_template('marks.html', title='Журнал', User=User, tests=tests, req=db_sess.query(Test), Test=Test,
                           db_sess=db_sess)


@app.route('/test/<int:test_id>', methods=['POST', 'GET'])
def game(test_id):
    if request.method == 'GET':
        return render_template("game.html", title="test")
    elif request.method == 'POST':
        req = request.json
        if req['request'] == 'get_words':
            db_sess = db_session.create_session()
            f = db_sess.query(Test).filter(Test.id == test_id).first()
            return json.dumps(
                {'test_id': f.id,
                 'name': f.name,
                 'words': list(map(lambda x: x['word'], json.loads(f.test)))})
        elif req['request'] == 'push_answers':
            db_sess = db_session.create_session()
            f = db_sess.query(Test).filter(Test.id == test_id).first()
            answers = list(map(lambda x: x['answer'], json.loads(f.test)))
            _sum = 0
            for i, j in enumerate(req['answers']):
                if j == answers[i]:
                    _sum += 1
            result = round(_sum / len(answers) * 100, 1)
            db_sess.add(Passing(test_id=f.id, user_id=current_user.id, percent=result))
            db_sess.commit()
            return '200'


@app.route('/register', methods=['GET', 'POST'])
def reqister():
    form = RegisterForm()
    if form.validate_on_submit():
        if form.password.data != form.password_again.data:
            return render_template('register.html', title='Регистрация',
                                   form=form,
                                   message="Пароли не совпадают")
        db_sess = db_session.create_session()
        if db_sess.query(User).filter(User.login == form.login.data).first():
            return render_template('register.html', title='Регистрация',
                                   form=form,
                                   message="Такой пользователь уже есть")
        user = User()

        user.login = form.login.data
        user.name = form.name.data
        user.group = form.group.data
        user.teacher_id = db_sess.query(UserURL).filter(UserURL.url == form.teacher_url.data).first().teacher_id
        user.role = 'student'

        user.set_password(form.password.data)
        db_sess.add(user)
        db_sess.commit()
        return redirect('/login')
    return render_template('register.html', title='Регистрация', form=form)


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        db_sess = db_session.create_session()
        user = db_sess.query(User).filter(User.login == form.login.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=True)
            return redirect("/")
        return render_template('login.html',
                               message="Неправильный логин или пароль",
                               form=form)
    return render_template('login.html', title='Авторизация', form=form)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect("/")


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)


if __name__ == '__main__':
    # db_session.global_init(os.environ.get("DATABASE_URL").replace("postgres://", "postgresql://", 1))

    db_session.global_init("db/database.db")
    app.register_blueprint(api.blueprint)
    port = int(os.environ.get("PORT", 5000))
    '''
    db_sess = db_session.create_session()
    user = User()

    user.login = 'breadnt'
    user.name = 'Вахрушев Богдан'
    user.group = '10В'
    user.role = 'admin'

    user.set_password('Zakonomernost22')
    db_sess.add(user)
    db_sess.commit()
    adm_url = UserURL()
    adm_url.url = 'ялквмом'
    adm_url.teacher_id = db_sess.query(User).filter(User.login == 'breadnt').first().id
    db_sess.add(adm_url)
    db_sess.commit()
    
    db_sess = db_session.create_session()
    test = Test()
    test.teacher_id = db_sess.query(User).filter(User.login == 'breadnt').first().id
    test.name = 'Тест на ударения'
    test.test = '[{"word": "слово","answer": 1},{"word": "завидно","answer": 1},{"word": "форзац","answer": 2}]'

    db_sess.add(test)
    db_sess.commit()
    '''

    app.run(host='0.0.0.0', port=port)
    # mabezmenova UKM-dMQ-CiV-Mp8
