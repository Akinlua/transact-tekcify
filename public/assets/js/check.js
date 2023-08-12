
//check_for_atleast_one == show or not show the delete btton
function getID() {
    console.log('start')
    let id_array = []

    
    for (var i = 0; i < document.getElementsByClassName('checks5').length; i++) {
        let id = document.getElementsByClassName('checks5')[i].value
        id_array.push(id);
    }
    console.log(id_array)
    fetch('/transactions/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            id_array: id_array,
        })
    }).then(function(res){
        console.log(res)
        return res.json()
    }).then(function(data){
        console.log(data)
    })
}



function start(){
console.log('hi')

document.getElementById('checkbtn').hidden = true;
}      

function cancel(){
document.getElementById("form").onsubmit = event.preventDefault();
}

function check(){

var i1= document.getElementById('check1')
check_for_atleast_one()


if (i1.checked==true){
    checkAll()
    check_for_atleast_one()

}
else{
    uncheckAll()
    check_for_atleast_one()

}

}


function checkAll(){
console.log("hey")

var inputs = document.querySelectorAll('.check2')
for (var i=0; i<inputs.length; i++){
    inputs[i].checked = true;
}
}

function uncheckAll(){

console.log("hi")

var inputs = document.querySelectorAll('.check2')
for (var i=0; i<inputs.length; i++){
    inputs[i].checked = false;
}
}

function check_one(value){

check_for_atleast_one();

var i1= document.getElementById(value);
console.log(i1.value)
var i2= document.getElementById('check1')


if (i1.checked==false){
console.log("yes")

    if(i2.checked==true){
    document.getElementById('check1').checked = false
    check_for_atleast_one();

    }
}

else if(i1.checked==true){

    // to check if all the checkboxes are checked
    var chec= check_for_all()
    console.log(chec);

    if(i2.checked==false && chec==true){
    document.getElementById('check1').checked = true
    check_for_atleast_one();

    }
}



}

// to check if all is checked


function check_for_all(){
var inputs = document.querySelectorAll('.check2')
var allChecked = true;


// check if each checkbox is not checked
for (var i=0; i<inputs.length; i++){
    if (!inputs[i].checked){
    allChecked = false;
    break;
    }
}


if (allChecked){
    return true;
}
else{
    return false
}
}

//function to check if at least one checkbox is checked so as to show the delete buttton
function check_for_atleast_one(){
var inputs = document.querySelectorAll('.check2')
var atLeastOneChecked = false;

for (var i=0; i<inputs.length; i++){
    if (inputs[i].checked){
    atLeastOneChecked = true;
    break;
    }
}

if (atLeastOneChecked){
    document.getElementById('checkbtn').hidden = false;
    
}
else
    document.getElementById('checkbtn').hidden = true;

}





