from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_bcrypt import Bcrypt
import mysql.connector
import random
import openai

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'  # Change this later

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

# 🔥 OpenRouter Setup
openai.api_base = "https://openrouter.ai/api/v1"
openai.api_key = "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"  # ← Replace this with your OpenRouter API Key

# --- Routes ---

@app.route('/')
def index():
    return render_template('index.html')

from flask import session

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user and bcrypt.check_password_hash(user['password'], password):
            # Set session for user ID
            session['user_id'] = user['id']  # Assuming 'id' is the primary key of your users table
            print(f"User ID saved to session: {session['user_id']}")  # Debug print
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password.', 'danger')

    return render_template('login.html')
def get_user_from_db():
    user_id = session.get('user_id')  # Get the user_id from session
    if not user_id:
        # Kung walang session, redirect to login
        flash('You must be logged in to view your profile.', 'warning')
        return redirect(url_for('login'))  # Redirect to login page if user_id not found in session
    
    cursor.execute("SELECT first_name, last_name FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    
    if user:
        return user
    else:
        return None  # In case walang user found


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        birth_day = request.form['birth_day']
        birth_month = request.form['birth_month']
        birth_year = request.form['birth_year']
        gender = request.form['gender']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        # Check if passwords match
        if password != confirm_password:
            flash('Passwords do not match!', 'danger')
            return redirect(url_for('register'))

        # Check if username already exists
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            flash('Username already exists.', 'danger')
            return redirect(url_for('register'))

        # Hash the password
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

        # Insert user into database
        cursor.execute("""
            INSERT INTO users 
            (username, first_name, last_name, birth_day, birth_month, birth_year, gender, password)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (username, first_name, last_name, birth_day, birth_month, birth_year, gender, hashed_pw))
        db.commit()

        flash('Registration successful! You can now log in.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')

# ✅ CHATBOT API ROUTE
@app.route('/chatbot-api', methods=['POST'])
def chatbot_api():
    try:
        user_message = request.json['message']

        response = openai.ChatCompletion.create(
            model="openai/gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Counticus, a wise math wizard. "
                        "IMPORTANT: Never directly give the final answer to math problems. "
                        "Instead, only provide helpful hints, strategies, or steps to solve it. "
                        "Encourage the student to try solving it themselves."
                    )
                },
                {"role": "user", "content": user_message}
            ]
        )

        reply = response['choices'][0]['message']['content'].strip()
        return jsonify({"reply": reply})

    except Exception as e:
        print("❌ OpenRouter Error:", e)
        return jsonify({"reply": "Oops! Counticus couldn’t reach the magic scrolls. Try again later."})

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/stages')
def stages():
    selected_map = request.args.get('map', None)
    return render_template('stages.html', selected_map=selected_map)

@app.route('/dashboard')
def dashboard():
    user = get_user_from_db()
    if not user:
        flash('User not found or not logged in.', 'danger')
        return redirect(url_for('login'))
    
    return render_template('dashboard.html', first_name=user['first_name'], last_name=user['last_name'])


@app.route('/roadmap')
def roadmap():
    return render_template('roadmap.html')

@app.route('/shop')
def shop():
    return render_template('shop.html')

@app.route('/collectibles')
def collectibles():
    return render_template('collectibles.html')

@app.route('/monster_atlas')
def monster_atlas():
    return render_template('monster_atlas.html')

@app.route('/logout')
def logout():
    return redirect(url_for('login'))

@app.route('/forgot-password')
def forgot_password():
    return render_template('forgot_password.html')

@app.route('/game', methods=['GET'])
def game():
    user_id = 1  # Hardcoded user ID

    # Get selected map and stage from query parameters
    selected_map = request.args.get('map', '')
    selected_stage = request.args.get('stage', '')

    # Get user's first name
    cursor.execute("SELECT first_name FROM users WHERE id = %s", (user_id,))
    user_row = cursor.fetchone()
    first_name = user_row['first_name'] if user_row and 'first_name' in user_row else "PLAYER"

    # Render the game template with the necessary context
    return render_template(
        'game.html',
        first_name=first_name,
        selected_map=selected_map,
        selected_stage=selected_stage
    )




if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)

    