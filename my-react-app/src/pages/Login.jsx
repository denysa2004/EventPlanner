import '../styles/Login.css' ;

function Login() {

return (
    <div className="login-page"> 
      <div className="login-form">
        <h1 className="login-title" >Event Planner </h1>

        <input
          placeholder="Email"
          type="email"
          autoComplete="off"
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="off"
        
        />
        <button >Log In</button>
        <p>
          Don't have an account ? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
