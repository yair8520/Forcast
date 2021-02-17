(function (window,document,undefined)
    {

        window.onload = init;

        //=============================================================================================================

        function init() {

            document.getElementById("form").addEventListener('submit',valdiatePassword);

        }
        //=============================================================================================================
        //validate if password are equal
        function valdiatePassword(event) {
            let onePassword = document.getElementById("password");
            let twoPassword = document.getElementById("psw_repeat");
            if (!(onePassword.value===twoPassword.value)) {
                alert("The passwords are not matches. Try again please");
                document.getElementById("form").reset();
                event.preventDefault();
            }
        }
    }
)(window,document,undefined);


