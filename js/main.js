var UserAPP = window.UserAPP || {};

(function scopeWrapper() {
    var poolData = {
        UserPoolId : _config.cognito.userPoolId, 
        ClientId : _config.cognito.clientId 
    };	
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var verificationCode = "";

    window.onload = function() {
        $("#toast").hide();
        $(".confirmpass").hide();
        $(".passcond").hide();
        $(".submit_button").hide();
    }

    UserAPP.checkLogin = function (redirectOnRec, redirectOnUnrec) {
        var cognitoUser = userPool.getCurrentUser();
        if (cognitoUser !== null) {
            if (redirectOnRec) {
                window.location = 'upload.html';
            }
        } else {
            if (redirectOnUnrec) {
                window.location = '404.html';
            }
        }
    };

    UserAPP.login = function () {
        var username = $('#username').val();
        var authenticationData = {
            Username: username,
            Password: $('#password').val()
        };

        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                var accessToken = result.getAccessToken().getJwtToken();
                    // console.log("accessToken"+accessToken);
                userPool.getCurrentUser().getSession(function(err, session) { 
                    var identityToken = session.getIdToken().getJwtToken();
                    // console.log("identityToken"+identityToken);
                })
                window.location = 'upload.html';
            },
            onFailure: function (err) {
               // alert(err.message || JSON.stringify(err));
                if(err.message == "Missing required parameter USERNAME"){
                    alert("Missing required parameter email");
                }else{
                    alert(err.message);
                }
            }
        });
    };
    UserAPP.forgotpass = function () {
        if ($('#username').val()!="")
            {
                var userData = {
                    Username : $('#username').val(),
                    Pool : userPool,
                };
                var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
                cognitoUser.forgotPassword({
                    onSuccess: function (result) {
                        console.log('call result: ' + result);
                    },
                    onFailure: function(err) {
                        alert(err.message);

                    },
                    inputVerificationCode() {
                        while(verificationCode.length != 6){
                            verificationCode = prompt('Please input verification code' ,'');
                            break;
                        }
                        $(".email").hide();
                        $(".login_button").hide();
                        $(".forgot_pass").hide();
                        $(".confirmpass").show();
                        $(".passcond").show();
                        $(".submit_button").show();
                    }
                });
            }else{
                alert("Please enter the registered email");
                $('#username').focus();
            }
    }

    UserAPP.confirmPassword = function () {
        var username = $('#username').val();
        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        
        return new Promise((resolve, reject) => {
            cognitoUser.confirmPassword(verificationCode, $('#password').val(), {
                onFailure(err) {
                    reject(err);
                },
                onSuccess() {
                    alert("Success ! You have reset your password");
                    resolve();
                    window.location = "index.html";
                },
            });
        });
    }

    UserAPP.logout = function () {
        var cognitoUser = userPool.getCurrentUser();
        cognitoUser.signOut();
        window.location = 'index.html';
    };

    UserAPP.hide_toast = function () {
        $("#regform").trigger("reset");
        $("#logform").trigger("reset");
        $("#toast").hide();
    }

    UserAPP.signup = function () {
        var username = $('#emailsignup').val();
        var password = $('#passwordsignup').val();
        var fname = $('#fname').val();
        var lname = $('#lname').val();

        var attributeList = [];
		var dataEmail = {
			Name : 'email', 
			Value : username
		};
		var dataFirstName = {
			Name : 'given_name', 
			Value : fname
		};
		var dataLastName = {
			Name : 'family_name', 
			Value : lname
		};
        
        
		var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
		var attributeFirstName = new AmazonCognitoIdentity.CognitoUserAttribute(dataFirstName);
		var attributeLastName = new AmazonCognitoIdentity.CognitoUserAttribute(dataLastName);
		
		attributeList.push(attributeEmail);
		attributeList.push(attributeFirstName);
		attributeList.push(attributeLastName);
        console.log(attributeList);
        userPool.signUp(username, password, attributeList, null, function (err, result) {
                
                if (err) {
                    console.log(err.message);
                    console.log(JSON.stringify(err));
                    alert(err.message);
                } 
                if (result) {
                    $("#toast").show();
                    $("#regform").trigger("reset");
                }
                
            });
    };
})();