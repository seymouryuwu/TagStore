var data = {
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.clientId
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();
var identityToken;

window.onload = function() {
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }
            // console.log('session validity: ' + session.isValid());
            //Set the profile info
            identityToken = session.getIdToken().getJwtToken();
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
        window.location = '404.html';
    }
}

function signOut() {
    if (cognitoUser != null) {
        cognitoUser.signOut();
        alert("Signing out !!!");
        window.location = "index.html";
    }
}

var myFile = null;

function importFile() {
    myFile = document.querySelector('input[type=file]').files[0];
    document.getElementById("choosefile").innerHTML = myFile.name;
    var res = myFile.name.split(".");
    if(res.length!=2){
        alert("Choose correct file");
        myFile = null;
        document.getElementById("choosefile").innerHTML ="Choose fileß";
    }else{
        console.log("working");
        console.log(res[1]);
        if(res[1] == "jpg" || res[1]=="png" || res[1]=="JPG" || res[1]=="PNG"){
            return;
        }else{
            alert("Choose correct file");
            myFile = null;
            document.getElementById("choosefile").innerHTML ="Choose file";
        }
    }

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
    //console.log(r.substring(23)); 
    var myFile1 = myFile;
    myFile = null;
    var upload = {
        "name": myFile1.name,
        "image": r.substring(23)
    };
    
    ///// editing here
    var cid;
    var uploadresponse = document.getElementById("uploadresponse");
    while (uploadresponse.childNodes.length > 4) {
        uploadresponse.removeChild(uploadresponse.childNodes[0]);
    }
    var len = uploadresponse.childNodes.length;
    if(len==0){
        var para = document.createElement('p');
        cid = 100000;
        para.id = cid;
        uploadresponse.appendChild(para);

    }else{
        var idn = uploadresponse.childNodes[len-1].id;
        console.log(idn);
        var para = document.createElement('p');
        cid = idn+1;
        para.id = cid;
        uploadresponse.appendChild(para);

    }
    document.getElementById(cid).innerHTML = myFile1.name+"  --> Processing".italics();
    document.getElementById(cid).style.color = "red";
    document.getElementById(cid).style.fontWeight = "bold";
    /// till here
    
    console.log(upload);
    (async () => {
        const rawResponse = await fetch('https://ydi233j2t0.execute-api.us-east-1.amazonaws.com/v1/upload', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization':identityToken
            },
            body: JSON.stringify(upload)
        });
        
        const content = await rawResponse.json();
        if (rawResponse.status === 200){
            document.getElementById(cid).innerHTML = myFile1.name+"  --> Successfully Uploaded".italics();
            document.getElementById(cid).style.color = "green";
            //alert(content + " " + myFile.name);
            console.log(content);
        }else {
            document.getElementById(cid).innerHTML = myFile1.name+"  --> Upload Unsuccessful".italics();
            document.getElementById(cid).style.color = "red";
        }
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
                'Content-Type': 'application/json',
                'Authorization':identityToken
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
            alert("No image found")
        } else {
            var tagsresponse = document.getElementById("tagsresponse");

            // to remove the child node if exists
            while (tagsresponse.childNodes.length > 0) {
                tagsresponse.removeChild(tagsresponse.childNodes[0]);
            }

            // to write new value in the web page
            for (var i = 0; i < content["links"].length; i++) {
                
                var link = document.createElement('a');
                link.href = content["links"][i];
                
                // var a = document.createElement('img');
                // a.src = content["links"][i];
                // a.id = i;
                var card = document.createElement('figure');
                var img = document.createElement('img');
                img.src = content["links"][i];
                img.id = i;
                card.appendChild(img);
                link.appendChild(card);

                
                //var li = document.createElement('li');
                //li.appendChild(a);

                //var ul = document.createElement('ul');
                //ul.appendChild(li);

                //tagsresponse.appendChild(ul);
                //a.class = "col-md-4";
                tagsresponse.appendChild(link);

                const style = document.createElement('style');

                // add CSS styles
                style.innerHTML = `

                #background {
                    height: 700px;
                    width: 100%;
                    background-image: url(http://garchitecture.ca/php/images/headers/wood.jpg);
                    padding-top: 20px;
                    overflow-y: scroll;
                }

                #tagsresponse {
                    width: 100%;
                    margin: auto;
                    padding:2%;
                }

                #tagsresponse figure {
                    float: left;
                    position: relative;
                    background-color: white;
                    text-align: center;
                    font-size: 15px;
                    padding: 10px;
                    margin: 1%;
                    height:380px;
                    box-shadow: 1px 2px 3px black;
                    -webkit-transform : rotate(-10deg);
                    z-index: 1;
                }

                #tagsresponse figure img {
                    height:200px;
                    width:300px;
                }
                #tagsresponse figure:hover {
                    box-shadow: 5px 10px 100px black;
                    -webkit-transform: scale(1.1,1.1);
                    z-index: 20;
                  }
                `;

                //document.getElementById(i).innerHTML = content["links"][i];
                document.head.appendChild(style);
                // document.getElementById(i).classList.add("img-thumbnail");
                // // document.getElementById(i).style.width = "500px";
                document.getElementById(i).style.height = "300px";
                
            }
        }
        //console.log(content);
    })();
}