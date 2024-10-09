/* The UpdateText function targets the HTML element with Id aninimated.The text in the 
element will be animated */
function updateText(text){

    let delay = 200;
    
    let h1 = document.getElementById("animated");
/* Here i am splitting the name of the game Maze Danger into individual letters,and wrapp
each letter into a span element which will allow animation to be applied to each letter,
    and lastly join the elements into one string */
        h1.innerHTML = text
        .split("")
        .map(letter => {
            console.log(letter);
            return `<span>` + letter + `</span>`;
        })
        .join("");
/* Here basically i convert each span element wrapping each letter into an array,
    to be able to iterate through them.And also add a wavy class to each letter,which adds
a wave like movement to text. */
        Array.from(h1.children).forEach((span, index) => {
        setTimeout(() => {
            span.classList.add("wavy");
        }, index * 60 + delay);
        });

}
/* This eventLister it is responsible for calling updateText function everytime a page is loadded,
    this is the text which will be animated and displayed on the first page of the game */
window.addEventListener('load', function () {
    updateText("Maze Danger");
  })
