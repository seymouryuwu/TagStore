var data = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.clientId
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();

window.onload = function() {
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }
            console.log('session validity: ' + session.isValid());
            //Set the profile info
            cognitoUser.getUserAttributes(function(err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(result);
                document.getElementById("username").innerHTML = "Welcome " + result[2].getValue() + " !";
            });

        });
    } else {
        window.location = "index.html";
    }
}

function signOut() {
    if (cognitoUser != null) {
        cognitoUser.signOut();
        alert("Sign Out Successfully!!");
        window.location = "index.html";
    }
}

var myFile = null;

function importFile() {
    myFile = document.querySelector('input[type=file]').files[0];
    document.getElementById("choosefile").innerHTML = myFile.name;
}

function uploadImage() {
    if (myFile == null) {
        alert("choose a file");
    } else {
        //alert("under construction");
        var file = myFile;
        var reader = new FileReader();
        reader.onloadend = function() {

            execUpload(reader.result);
            //console.log('RESULT', reader.result)
        }
        reader.readAsDataURL(file);
        document.getElementById("choosefile").innerHTML = "Choose file";
    }
}

function execUpload(r) {
    console.log(r.substring(23));

    var upload = {
        "name": myFile.name,
        "image": r.substring(23)
    };

    console.log(upload);
    (async () => {
        const rawResponse = await fetch('https://ydi233j2t0.execute-api.us-east-1.amazonaws.com/v1/upload', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(upload)
        });
        const content = await rawResponse.json();
        alert(content + " " + myFile.name);
        console.log(content);
    })();
}

function fetchdetails() {

    //alert("under construction");

    var tags = document.getElementById("tags").value;
    //console.log(tags);
    var tagsList = tags.split("and").map(function(item) {
        return item.trim();
    });;
    console.log(tagsList);
    //console.log(tagsList);
    (async () => {
        const rawResponse = await fetch('https://ydi233j2t0.execute-api.us-east-1.amazonaws.com/v1/search/', {
            method: 'POST',
            //mode:'no-cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "tags": tagsList
            })
        });

        const content = await rawResponse.json();

        if (content["links"].length == 0) {
            //console.log("empty");
            var tagsresponse = document.getElementById("tagsresponse");

            // to remove the child node if exists
            while (tagsresponse.childNodes.length > 0) {
                tagsresponse.removeChild(tagsresponse.childNodes[0]);
            }


            alert("No Image Found")
        } else {
            var tagsresponse = document.getElementById("tagsresponse");

            // to remove the child node if exists
            while (tagsresponse.childNodes.length > 0) {
                tagsresponse.removeChild(tagsresponse.childNodes[0]);
            }

            // to write new valuse in the web page
            for (var i = 0; i < content["links"].length; i++) {

                var a = document.createElement('a');
                a.href = content["links"][i];
                a.id = i;
                var li = document.createElement('li');
                li.appendChild(a);

                var ul = document.createElement('ul');
                ul.appendChild(li);

                tagsresponse.appendChild(ul);
                document.getElementById(i).innerHTML = content["links"][i];
            }
        }
        //console.log(content);
    })();
}