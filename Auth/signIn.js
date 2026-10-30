import { signIn } from "./auth.js";

// --- Sign In Logic ---
const signInButton = document.getElementById("signIn");

signInButton.addEventListener("click", async function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email !== "" && password !== "") {
        try {
            await signIn(email, password);

            alert("Sign-in successful!");
            window.location.href = "dashboard.html";

        } catch (error) {
            alert("Sign-in failed. Please check your email and password.");
            console.error(error.message);
        }

    } else {
        alert("Please enter your email and password.");
    }
});

// --- Redirect to Sign Up Logic ---
// Grab the newly named button
const signUpBtn = document.getElementById("signUpBtn");

if (signUpBtn) {
    signUpBtn.addEventListener("click", function () {
        // Redirects to your signup page. 
        // Make sure "signup.html" matches your actual file name!
        window.location.href = "signup.html"; 
    });
}