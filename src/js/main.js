app = angular.module('cacheVisualizer', []);

function nearestPowerOfTwo( val ) {
  var result = 0;
  
  result = Math.pow(2,Math.round(Math.log(parseInt(val))/Math.log(2)));

  return result;
}
function decToBin(dec) {
    return (dec >>> 0).toString(2);
}
function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}
function powOfTwo( val ) {
  var result = 0;
  result = Math.log(val)/Math.log(2);
  return result;
}
