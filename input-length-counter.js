class InputLengthCounter {
  element;
  type;
  maxLength;
  preVal;
  // if the existing content length is greater than the defined max length, we need to allow user to reduce it
  // so this indicates that if the content in the text field can be reduced
  isReduceable;
  counterCssClass = 'textarea-counter';

  constructor(element) {
    // Since jQuery selector returns a list of HTML elements, we only get the first one.
    // There is enhancement for this like initializing a list of elements from the list
    if (element instanceof jQuery) {
      element = element.get(0);
    }
    this.element = element;
    this.type = element.nodeName;
    this.preVal = element.value;
    this.maxLength = parseInt(element.getAttribute('maxlength'));

    this.init();
  }

  init() {
    this.validate();
    this.createElements();
  }

  /**
   * Validate if the input are Textarea or Input (text field only)
   **/
  validate() {
    if (this.type !== 'TEXTAREA' && this.type !== 'INPUT') {
      throw Error("Only support Textarea and Input!");
    }

    if (this.type === 'INPUT' && this.element.getAttribute('type') !== 'text') {
      throw Error("Only support text Input!");
    }

    if (isNaN(this.maxLength) || this.maxLength <= 0) {
      throw Error("Max length needs to be a number greater than 0");
    }
  }

  createElements() {
    // already initialized
    if (this.element.nextSibling?.classList?.contains(this.counterCssClass) === true) {
      return;
    }
    let initLength = this.countRealLength(this.element.value)
    this.counter = document.createElement("span");
    this.counter.innerText = initLength;

    // if the existing content length is greater than the defined one, indicate this var to be true
    this.isReduceable = initLength > this.maxLength;

    let maxLengthContainer = document.createElement("span");
    maxLengthContainer.innerText = `/${this.maxLength}`;

    let div = document.createElement("div");
    div.classList.add(this.counterCssClass);
    div.classList.add("text-right");
    div.appendChild(this.counter);
    div.appendChild(maxLengthContainer);

    this.element.insertAdjacentElement('afterend', div);

    // listening to keyup event
    this.element.addEventListener("keyup", this.counterHandler.bind(this));
  }

  /**
   * Update the counter as well as the content
   **/
  counterHandler() {
    let realLength = this.countRealLength(this.element.value);

    // if the existing content length is greater than the defined one, we don't allow user to input more, but they can reduce it
    // otherwise reset the content to the original one
    /** NOTE: we don't substring the original msg to fit the length because it will cause losing the last part of the msg */
    if (realLength > this.maxLength && (this.isReduceable === false || realLength > this.countRealLength(this.preVal))) {

      // if there is no existing content but the user copy data which exceeds the max length, we substrings it.
      if (this.preVal === '') {
        this.preVal = this.element.value.substring(0, this.maxLength - Math.abs(this.maxLength - realLength) + 1);
        this.counter.innerText = this.countRealLength(this.preVal);
      }

      this.element.value = this.preVal;
      return;
    }

    // turn off the flat when the length is back to defined range
    if (this.isReduceable === true && realLength < this.maxLength) {
      this.isReduceable = false;
    }

    this.preVal = this.element.value;
    this.counter.innerText = realLength;
  }

  /**
   * Count the real length of the string because different browsers count the new line differently.
   * Same as for JS. So this will make sure that the string length will be the same between JS and PHP
   **/
  countRealLength(string) {
    let newLines = string.match(/(\r\n|\n|\r)/g);
    let addition = 0;
    if (newLines != null) {
      addition = newLines.length;
    }
    return string.length + addition;
  }
}

// helper function for initializing the class
function initTextareaCounter() {
  try {
    new InputLengthCounter(this);
  } catch (e) {
    console.error(e);
  }
}

// add function to HTMl element
HTMLElement.prototype.showCounter = initTextareaCounter;

// add function to jQuery if $ is available
if (typeof $ === 'function') {
  $.fn.showCounter = initTextareaCounter;
}
