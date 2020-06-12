var poolData = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.clientId
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

function login() {

    var authenticationData = {
        Username: document.getElementById("username").value,
        Password: document.getElementById("password").value,
    };

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    var userData = {
        Username: document.getElementById("username").value,
        Pool: userPool,
    };

    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    if (document.getElementById("username").value != "") {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function(result) {
                var accessToken = result.getAccessToken().getJwtToken();
                //alert(accessToken);
                console.log(accessToken);
                window.location = "upload.html";
            },
            onFailure: function(err) {
                alert(err.message || JSON.stringify(err));
            },
        });
    }
}

function submitPassReset(verificationCode, cognitoUser) {
    document.getElementById("username").style.display = "none";
    document.getElementById("password").focus();
    document.getElementById("password").placeholder = "New Password";
    console.log(newPassword);
    console.log("verificationCode" + verificationCode);
    console.log("newPassword" + document.getElementById("password").value);
    // cognitoUser.confirmPassword(verificationCode, newPassword, this);
}

 function register() {
        
        fname =  document.getElementById("fname").value;
        lname =  document.getElementById("lname").value;
        email = document.getElementById("emailsignup").value;
        
        if (document.getElementById("passwordsignup").value != document.getElementById("passwordsignup_confirm").value) {
            alert("Passwords do not match!")
            throw "Passwords do not match!"
        } else {
            password =  document.getElementById("passwordsignup").value; 
        }

        var attributeList = [];
        
        var dataEmail = {
            Name : 'email', 
            Value : email, 
        };
        
        var dataFirstName = {
            Name : 'firstname', 
            Value : fname, 
        };

        var dataLastName = {
            Name : 'lastname', 
            Value : lname, 
        };

        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributeFirstName = new AmazonCognitoIdentity.CognitoUserAttribute(attributeFirstName);
        var attributeLastName = new AmazonCognitoIdentity.CognitoUserAttribute(attributeLastName);
        
        attributeList.push(attributeEmail);
        attributeList.push(attributeFirstName);
        attributeList.push(attributeLastName);
        //console.log(attributeList);
        userPool.signUp(username, password, attributeList, null, function(err, result){
            if (err) {
                alert(err.message || JSON.stringify(err));
                return;
            }
            cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());   
            //change elements of page
            document.getElementById("message").innerHTML = "Please check your email for a verification link";
            document.getElementById("formid").reset();
            
        });
      }

function forgotpasswordbutton() {

    if (document.getElementById("username").value != "") {
        var userData = {
            Username: document.getElementById("username").value,
            Pool: userPool,
        };

        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.forgotPassword({
            onSuccess: function(result) {
                console.log('call result: ' + result);
                alert("Success ! You have reset your password");
                window.location = "index.html";
            },
            onFailure: function(err) {
                alert(err.message);

            },
            inputVerificationCode() {
                document.getElementByClass("signInBtn").style.display = "none";
                document.getElementByClass("forgotBtn").style.display = "none";
                document.getElementByClass("submitBtn").style.display = "block";
                var verificationCode = "";
                while (verificationCode.length != 6) {
                    verificationCode = prompt('Please input verification code', '');
                    break;
                }
                //alert("Please Enter the New Password in the password field");
                // document.getElementById("inputUsername").style.display = "none";
                // document.getElementById("inputPassword").focus();
                // document.getElementById("inputPassword").placeholder = "New Password";
                // console.log(newPassword);
                // var timer = null;
                // $('#inputPassword').keyup(function(){
                //        clearTimeout(timer); 
                //        timer = setTimeout(doStuff, 1000)
                // });

                // function doStuff() {
                //     console.log("verificationCode"+verificationCode);
                //     console.log("newPassword"+document.getElementById("inputPassword").value);
                //     // cognitoUser.confirmPassword(verificationCode, newPassword, this);
                // }
            }
        });
    } else {
        alert("Please enter the registered email");
        document.getElementById("inputUsername").focus();
    }
}