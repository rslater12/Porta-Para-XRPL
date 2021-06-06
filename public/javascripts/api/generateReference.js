function makeReference(length) {
    var result           = '';
    var chara      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charaLength = chara.length;
    for ( var i = 0; i < length; i++ ) {
       result += chara.charAt(Math.floor(Math.random() * charaLength));
    }
    return result;
 }
 
 console.log(makeReference(8));