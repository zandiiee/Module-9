
import { signUp } from "./auth.js";

document.getElementById("signUp").addEventListener("click", async function () {
    const email = document.getElementById("email").value 
    const password = document.getElementById("password").value 
    const confirmPassword = document.getElementById("confirmPassword").value 
    const name = document.getElementById("name").value

    try {
        if(password === confirmPassword){
            await signUp(name, email, password);
        console.log("Sign-up successful!");
        window.location.href="dashboard.html";

        } else {
            alert("Passwords don't match")
        }
    } catch (error) {
        console.error("Sign-up failed:", error.message);
    }
});

