//var trashPoints = [[22, 54],[29, 67],[155,57],[150,32],[45,45],[77,233],[320,51],[74,405],[49,58],[22,301]];
//var pathPoints = [[1.183,3.637],[2.920,3.945],[4.615,1.289],[7.992,2.104],[7.805,3.154],[7.168,6.132],[6.040,5.874]];
var trashPoints = [[]];
var pathPoints = [[]];
// var pp = [[5,5],[10,30],[15,40],[60,80],[90,70],[50,100]]
var detectRad = 40;
var pointCount = 6;
var position = [0,0,0];
var robotVel = 10;
var multiplier = 30;
var newTrashCount = 0;
var count;

var tPoints = 'tPoints';
var pPoints = 'pPoints';
var firebaseRef = firebase.database().ref();

//pushRealPoint('p1', '40,15');
//pushRealPoint('p2', '30, 10');
//initialDataGrab();
createTrash();
document.getElementById('robot').style.left = position[0].toString()+'px';
document.getElementById('robot').style.top = (360-position[1]).toString()+'px';
staticGrabber(trashPoints,prevPoints);
// staticGrabber(pathPoints,pPoints);

dataGrabber();



function changePosX(delta1){
	position[0] += delta1;
	var posUpdateX = document.getElementById('robot').style.left = position[0].toString()+'px';
	// console.log('moving X');
}

function changePosY(delta2){
	position[1] += delta2;
	var posUpdateY = document.getElementById('robot').style.top = (360-position[1]).toString()+'px';
	// console.log('moving Y');
}

function rotateRobot(theta){
	position[2] = theta;
	var posUpdateDeg = document.getElementById('robot').style.transform ='rotate('+theta.toString()+'deg)';
	// console.log ('rotating');
}

function pushRealPoint (pointID, point){
	firebaseRef.child('tPoints').child(pointID).set(point);
	console.log ('point pushed: ' + pointID + '|' + point);
}

function snapshotToArray(snapshot) {
	var returnArr = [];
	snapshot.forEach(function(childSnapshot) {
		var item = childSnapshot.val();
		item.key = childSnapshot.key;
		returnArr.push(item);
		});
		return returnArr;
	}
//NO
function dataGrabber(){
	var rootRef = firebase.database().ref().child("desPoints");
		rootRef.on("child_added", function(snapshot) {
			var newVal = snapshot.val(); //Unsorted array of string values
			pointCount ++;
			updateTable('list',coordParse(newVal));
		});
	}

	function staticGrabber(outputList,dataListId){
		var rootRef = firebase.database().ref().child(dataListId);
			rootRef.once("value", function(snapshot) {
				var list = snapshotToArray(snapshot); //Unsorted array of string values
				for (var i = 0; i < list.length; i++) {
					item = list[i];
					outputList[i][0] = item.split(',')[0];
					outputList[i][1] = item.split(',')[1];
				}
			});
		}

	function coordParse(data) {
		point = [data.split(',')[0],data.split(',')[1]]
			// desX.push(point[0]);
			// desY.push(point[1]);
			pathPoints[pointCount][0] = point[0];
			pathPoints[pointCount][1] = point[1];
			return point;
		}

	function logPoints(){
		console.log("Read..");
		for (var i = 0; i < pathPoints.length; i++) {
			console.log(pathPoints[i][0]+','+pathPoints[i][1]);
		}
		console.log("Read Finished");
	}

	function updateTable(listID, point){
			var word = point[0].toString() +' , '+ point[1].toString();
			var itemId = "point: " + pointCount.toString();
			document.getElementById(listID).innerHTML += ('<li id = "'+itemId+'">'+word+'</li>');
	}

	button.onclick = function() {
		//calculate time stuff
		count = 0;
		let interval = 1000;
		let totalTime = pointCount*interval;
		let start = Date.now();
		let timer = setInterval(function() {
			let timePassed = Date.now() - start;
			var minDist = detectRad;
			var detour = [];
			for (var i = 0; i < trashPoints.length; i++) {
				var dist = Math.sqrt(Math.pow(trashPoints[i][0]-position[0],2)+Math.pow(trashPoints[i][1],2));
				if (dist < minDist) {
					minDist = dist;
					detour = trashPoints[i];
					trashPoints.splice(i,1);
				}
			}
			// if trash is close
			if (minDist < detectRad) {
				deltaX = detour[0]-position[0];
				deltaY = detour[1]-position[1];
				console.log("trash"+detour[0].toString()+detour[1].toString());
				document.getElementById('robot').style.left = (position[0]+deltaX).toString()+'px';
				document.getElementById('robot').style.top = (position[1]+deltaY).toString()+'px';

			}
			else{
				var deltaX = Math.round(pathPoints[count][0])*multiplier-position[0];
				var deltaY = Math.round(pathPoints[count][1])*multiplier-position[1];
				changePosX(deltaX);
				changePosY(deltaY);
				count ++;
			}

			var theta = position[2];
			if(deltaX != 0){
				theta = Math.round((180/Math.PI)*Math.atan(deltaY/deltaX));
			}else {
				theta = 0;
			}
			rotateRobot(theta);


			console.log(position[0].toString()+position[1].toString()+count.toString());


			if (timePassed > totalTime){
				for (var i = 0; i < trashPoints.length; i++) {
					pushRealPoint(newTrashCount,trashPoints[i][0].toString()+','+trashPoints[i][1].toString());
				}
				clearInterval(timer);
			}
		}, interval);
	}

function createTrash(){
	var zone = document.getElementById('map');
	for (var i = 0; i < trashPoints.length; i++) {
		zone.innerHTML += '<span id="'+i.toString()+'" class="trashP">'+'</span>';
	}
	placeTrash();
}


function placeTrash(){
	for (var i = 0; i < trashPoints.length; i++) {
		document.getElementById(i.toString()).style.top = (360-trashPoints[i][0]).toString()+'px';
		document.getElementById(i.toString()).style.bottom = trashPoints[i][1].toString()+'px';
		document.getElementById(i.toString()).style.zIndex = i+10;
	}
}
