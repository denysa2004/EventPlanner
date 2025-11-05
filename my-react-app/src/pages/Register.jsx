import '../styles/Register.css';

function Register() {
  return (
    <div className="register-page">
      <div className="register-form">
        <h1 className="register-title">Create Account</h1>

        <input
          type="text"
          placeholder="Full Name"
          autoComplete="off"
        />
        <input
          type="email"
          placeholder="Email"
          autoComplete="off"
        />
        <input
          type="password"
          placeholder="Password"
          autoComplete="off"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          autoComplete="off"
        />

        <button>Register</button>

        <p>
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
