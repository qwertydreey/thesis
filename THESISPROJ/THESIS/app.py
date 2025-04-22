from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_bcrypt import Bcrypt
import mysql.connector
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # change this later

# Initialize extensions
bcrypt = Bcrypt(app)

# Connect to MySQL
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="qweqwe",
    database="learning_game"
)
cursor = db.cursor(dictionary=True)

# Routes

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user and bcrypt.check_password_hash(user['password'], password):
            # You can implement login logic here (session, cookies)
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password.', 'danger')

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            flash('Username already exists.', 'danger')
            return redirect(url_for('register'))

        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_pw))
        db.commit()
        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/multiplication_mirage')
def multiplication_mirage():
    return render_template('multiplication_mirage.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/roadmap')
def roadmap():
    return render_template('roadmap.html')

@app.route('/shop')
def shop():
    return render_template('shop.html')

@app.route('/logout')
def logout():
    # Implement logout logic (session, cookies)
    return redirect(url_for('login'))

# Forgot password route
@app.route('/forgot-password')
def forgot_password():
    return render_template('forgot_password.html')

# The route that renders the initial game page with a question
@app.route('/game', methods=['GET'])
def game():
    user_id = 1  # Use a hardcoded user ID for now (skip login part)
    
    # Get current difficulty for the user
    cursor.execute("SELECT current_difficulty FROM user_progress WHERE user_id = %s", (user_id,))
    row = cursor.fetchone()

    if not row:
        cursor.execute("INSERT INTO user_progress (user_id, current_difficulty) VALUES (%s, 'easy')", (user_id,))
        db.commit()
        difficulty = 'easy'
    else:
        difficulty = row['current_difficulty']

    # Fetch a random question based on difficulty
    cursor.execute("SELECT * FROM questions WHERE difficulty = %s", (difficulty,))
    questions = cursor.fetchall()
    question = random.choice(questions) if questions else None

    # Render the game page and pass the question to the template
    return render_template('game.html', question=question)


@app.route('/submit-answer', methods=['POST'])
def submit_answer():
    try:
        data = request.get_json()
        user_answer = data.get('answer')
        question_id = data.get('question_id')

        if not user_answer or not question_id:
            return jsonify({'error': 'Missing required fields'}), 400

        user_id = 1  # Hardcoded user ID

        cursor.execute("SELECT * FROM questions WHERE id = %s", (question_id,))
        question = cursor.fetchone()

        if not question:
            return jsonify({'error': 'Question not found'}), 404

        is_correct = user_answer.strip() == question['correct_answer'].strip()

        if is_correct:
            cursor.execute(""" 
                UPDATE user_progress 
                SET correct_answers = correct_answers + 1 
                WHERE user_id = %s
            """, (user_id,))
        else:
            cursor.execute(""" 
                UPDATE user_progress 
                SET wrong_answers = wrong_answers + 1 
                WHERE user_id = %s
            """, (user_id,))

        cursor.execute("SELECT correct_answers, wrong_answers FROM user_progress WHERE user_id = %s", (user_id,))
        stats = cursor.fetchone()
        total = stats['correct_answers'] + stats['wrong_answers']
        accuracy = stats['correct_answers'] / total if total > 0 else 0

        if accuracy >= 0.8:
            new_diff = 'hard'
        elif accuracy >= 0.5:
            new_diff = 'medium'
        else:
            new_diff = 'easy'

        cursor.execute("UPDATE user_progress SET current_difficulty = %s WHERE user_id = %s", (new_diff, user_id))
        db.commit()

        # Return the new question
        return jsonify({'success': True, 'new_question': get_new_question_data(user_id)})

    except Exception as e:
        return jsonify({'error': 'There was a problem submitting your answer.'}), 500


def get_new_question_data(user_id):
    cursor.execute("SELECT current_difficulty FROM user_progress WHERE user_id = %s", (user_id,))
    row = cursor.fetchone()

    if not row:
        cursor.execute("INSERT INTO user_progress (user_id, current_difficulty) VALUES (%s, 'easy')", (user_id,))
        db.commit()
        difficulty = 'easy'
    else:
        difficulty = row['current_difficulty']

    cursor.execute("SELECT * FROM questions WHERE difficulty = %s", (difficulty,))
    questions = cursor.fetchall()
    question = random.choice(questions) if questions else None

    if question:
        return {
            'question_text': question['question_text'],
            'correct_answer': question['correct_answer'],
            'id': question['id']
        }
    else:
        return {'error': 'No questions available for this level.'}


@app.route('/get-new-question', methods=['GET'])
def get_new_question():
    try:
        user_id = 1  # Hardcoded user ID
        
        # Fetch new question for the current user
        question_data = get_new_question_data(user_id)

        if 'error' in question_data:
            return jsonify({'error': question_data['error']}), 404

        return jsonify(question_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
