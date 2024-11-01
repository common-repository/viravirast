let editorTemp = null;
const viravirastRedirectTo = (page, params = {}) => {
  let url = new window.URL(document.location);
  url.searchParams.set("page", page);
  Object.keys(params).map((item) => {
    url.searchParams.set(item, params[item]);
  });
  window.open(url.toString(), "_self");
};

const viravirastGetParam = (name) => {
  let url = new window.URL(document.location);
  const param = url.searchParams.get(name);
  return param;
};

const viravirastValidateLogin = async (username, password) => {
  try {
    const response = await jQuery.ajax({
      type: "POST",
      url: ajaxurl,
      data: {
        action: "viravirast_authenticate",
        data: {
          username: username,
          password: btoa(password),
        },
      },
    });
    if (response.status == 200 || response.status == 201) {
      return response.body;
    } else {
      console.log("something went wrong");
    }
  } catch (err) {
    console.log(err);
  }
  return false;
};

const vvDelay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

let iframeDocument = document;
let isViravirastEnabled = !(IS_VIRAVIRAST_ENABLED == "false");
let isViravirastToggleInProgress = false;
const viravirastHandleToggle = async (el) => {
  if (!isViravirastToggleInProgress) {
    const label = el.childNodes[0];
    const toggler = el.childNodes[1];
    isViravirastEnabled = !isViravirastEnabled;
    label.innerHTML = isViravirastEnabled
      ? VIRAVIRAST_DISABLED_LABEL
      : VIRAVIRAST_ENABLED_LABEL;
    toggler.checked = isViravirastEnabled;
    // todo make an ajax to update the options

    try {
      isViravirastToggleInProgress = true;
      const response = await jQuery.ajax({
        type: "POST",
        url: ajaxurl,
        data: {
          action: "viravirast_toggleEnabled",
          data: {},
          enabled: isViravirastEnabled ? "true" : "false",
        },
      });
      if (response.status == 200 || response.status == 201) {
        isViravirastToggleInProgress = false;
        return response.body;
      } else {
        isViravirastToggleInProgress = false;
        console.log("something went wrong");
        toggler.checked = !isViravirastEnabled;
      }
    } catch (err) {
      isViravirastToggleInProgress = false;
      toggler.checked = !isViravirastEnabled;
      console.log(err);
    }
  } else {
    const toggler = el.childNodes[1];
    toggler.checked = isViravirastEnabled;
  }
  return false;
};

const viravirastIgnoreWordApi = async (word) => {
  try {
    const response = await jQuery.ajax({
      type: "POST",
      url: ajaxurl,
      data: {
        action: "viravirast_ignore_word",
        word: word,
      },
    });
    if (response.status == 200 || response.status == 201) {
      return {
        body: response.body,
      };
    } else {
      console.log(response, "something went wrong");
    }
  } catch (err) {
    console.log(err);
  }
  return {
    body: null,
  };
};

const viravirastValidateText = async (requestId, Text, test = true) => {
  if (test) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          requestId: requestId,
          body: returnSamples.missSpell4 ?? false,
        });
      }, 2000);
    });
    // return {
    //   requestId: requestId,
    //   body: returnSamples.missSpell2??false
    // };
  }
  try {
    const response = await jQuery.ajax({
      type: "POST",
      url: ajaxurl,
      data: {
        action: "viravirast_validate_text",
        data: {
          Text: Text,
          // DoMeaningChecke: DoMeaningChecker,
          // DoPersianAutomaticPunctuation: DoPersianAutomaticPunctuation,
          // PersianSpellCheck: PersianSpellCheck,
          // DoStructureChecker: DoStructureChecker,
        },
      },
    });
    if (response.status == 200 || response.status == 201) {
      if (response.body.HttpStatusCode != 200) {
        Noti({
          status: "error",
          content: response.body.Result.msg,
          timer: 20000,
          animation: true,
          progress: true,
          bgcolor: "linear-gradient(60deg,#ff3333,#ff4444)",
          icon: "show",
        });
      }
      return {
        requestId: requestId,
        body: response.body,
      };
    } else {
      console.log(response, "something went wrong");
      Noti({
        status: "error",
        content: "مشکلی در دریافت اطلاعات پیش آمده!",
        timer: 20000,
        animation: true,
        progress: true,
        bgcolor: "linear-gradient(60deg,#ff3333,#ff4444)",
        icon: "show",
      });
    }
  } catch (err) {
    console.log(err);
  }
  return {
    requestId: requestId,
    body: null,
  };
};

class ViravirastTextHandler {
  constructor(html, blockId) {
    this.html = `<div>${html}</div>`;
    this.blockId = blockId;
    this.stack = [];
    this.texts = [];
    this.changed = null;
  }
  destructor() {
    console.log(`ViravirastTextHandler with ${this.blockId} is destroyed`);
  }

  richToPlain() {
    let parser = new DOMParser();
    let doc = parser.parseFromString(this.html, "text/html");

    const traverse = (node, parent) => {
      for (let child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          this.texts.push({
            text: child.nodeValue,
            parent: child.parentNode,
          });
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          let attr = {};
          for (let i = 0; i < child.attributes.length; i++) {
            attr[child.attributes[i].name] = child.attributes[i].value;
          }
          let el = {
            tag: child.tagName,
            attr: attr,
            class: child.className,
            childNodes: child.childNodes,
            isSelfClosing: false,
            parent: child.parentNode,
          };
          if (!child.childNodes.length) {
            // Check if tag is self-closing
            el.isSelfClosing = true;
            this.stack.push(el);
          } else {
            this.stack.push(el);
            traverse(child, el);
          }
        }
      }
    };
    traverse(doc.body, null);
    console.table(this.texts);
    console.table(this.stack);
  }

  plainToRich() {
    let outHTML = "";
    let textIndex = 0;

    const traverse = (node) => {
      outHTML = "";
      for (let i = 0; i < node.childNodes.length; i++) {
        let child = node.childNodes[i];
        if (child.nodeType === Node.TEXT_NODE) {
          outHTML += this.texts[textIndex].text;
          textIndex++;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          outHTML += "<" + child.tagName;
          for (let j = 0; j < child.attributes.length; j++) {
            outHTML +=
              " " +
              child.attributes[j].name +
              "='" +
              child.attributes[j].value +
              "'";
          }
          if (!child.childNodes.length) {
            outHTML += "/>";
            outHTML += traverse(child);
          } else {
            outHTML += ">";
            outHTML += traverse(child);
            outHTML += "</" + child.tagName + ">";
          }
        }
      }
      return outHTML;
    };

    traverse(this.stack[0]); //start with the root node

    // todo refactor
    let child = this.stack[0];
    this.changed = "<" + child.tag;
    let attributes = Object.keys(child.attr);
    for (let j = 0; j < attributes.length; j++) {
      this.changed +=
        " " + attributes[j] + "='" + child.attr[attributes[j]] + "'";
    }
    this.changed += ">";
    this.changed += outHTML;
    this.changed += "</" + child.tag + ">";

    var wrapper = document.createElement("div");
    wrapper.innerHTML = this.changed;
    this.changed = wrapper.firstChild.innerHTML;
  }
}

const localIgnore = {};

let ignoreMutation = false;

let ViraVirastHighlights = [];
let isRelocating = false;
let viravirastTimeoutRelocate = null;
const blocksAdditionalIndexed = {};

const setVVAttr = (element, arr) => {
  return element.setAttribute("vv", arr);
};
const viraVirastHandleToggleSuggested = (id, isClassic) => {
  jQuery(
    `.viravirast-suggesteds-show:not(#viravirast-suggesteds-${id})`
  ).removeClass("viravirast-suggesteds-show");
  const elem = document.getElementById(`viravirast-suggesteds-${id}`);

  elem.classList.toggle("viravirast-suggesteds-show");

  const rect = elem.getBoundingClientRect();
  let relativeTop = parseInt(
    elem.style.getPropertyValue("--top").replace("px", "")
  );
  let relativeLeft = parseInt(
    elem.style.getPropertyValue("--left").replace("px", "")
  );

  let top = rect.y;
  let left = rect.x;

  let p = null;
  if (isClassic) {
    p = document.getElementById("wpcontent").getBoundingClientRect();
  } else {
    p = document
      .querySelector(".interface-interface-skeleton__body")
      .getBoundingClientRect();
  }
  const parent = {
    width: p.right,
    height: p.bottom,
  };

  console.log(top, rect, parent);
  if (top < 0) {
    relativeTop = relativeTop + rect.height;
  }
  if (top + rect.height > parent.height) {
    relativeTop = relativeTop - rect.height;
  }
  if (left < 0) {
    relativeLeft = relativeLeft + rect.width;
  }
  if (left + rect.width > parent.width) {
    relativeLeft = relativeLeft - rect.width;
  }

  elem.style.setProperty("--top", `${Math.max(relativeTop, 0)}px`);
  elem.style.setProperty("--left", `${Math.max(relativeLeft, 0)}px`);
};

const viraVirastHandleRemoveHighlightById = (
  id,
  isTriggeredFromSelecting = false
) => {
  // console.log(`Removing ${id}`);
  let currentBlockProps;
  const index = ViraVirastHighlights.findIndex((key) => key.id == id);
  if (index != -1) {
    currentBlockProps = ViraVirastHighlights[index];
    ViraVirastHighlights.splice(index, 1);
    const elem = document.getElementById(`viravirast-highlight-${id}`);
    if (elem) elem.remove();
    else {
      console.log(`viravirast-highlight-${id}`, "not found");
    }

    const elem2 = document.getElementById(`viravirast-suggesteds-${id}`);
    if (elem2) elem2.remove();

    // should be in interval
    if (isTriggeredFromSelecting) {
      let waitForEndOfRelocateInterval = setInterval(() => {
        if (!isRelocating) {
          const hasMoreElement =
            ViraVirastHighlights.findIndex(
              (key) => key.blockId == currentBlockProps.blockId
            ) != -1;
          if (!hasMoreElement) {
            console.log("validating again");
            clearInterval(waitForEndOfRelocateInterval);
            inputEventCallback(
              "event",
              currentBlockProps.blockId,
              currentBlockProps.isClassic,
              0,
              currentBlockProps.isTitle
            );
            ignoreMutation = false;
          }
          clearInterval(waitForEndOfRelocateInterval);
        }
      }, 100);
    }
    // console.log("removed.");
  } else {
    console.log("not found.");
  }

  return currentBlockProps?.isTitle ? true : false;
};

const viraVirastHandleRemoveHighlightByBlockId = (blockId) => {
  const res = ViraVirastHighlights.filter((key) => key.blockId == blockId);
  if (res && res.length) {
    res.forEach((elem) => {
      viraVirastHandleRemoveHighlightById(elem.id);
    });
  }
};

const viraviraseAddIframeStyles = () => {
  const css = `
  .viravirast-block-loading:after {
    content: "";
    display: block;
    position: absolute;
    background-color: #fff;
    border-radius: 100px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 75%;
    height: 75%
  }

  .viravirast-block-loading {
    position: absolute;
    left: calc(var(--left) - 10px);
    top: calc(var(--top) + 12px + 55px);
    width: 24px;
    height: 24px;
    border-radius: 100px;
    background: conic-gradient(from 180.13deg at 50.12% 50.12%, rgba(255, 255, 255, 0.31) 0deg, #00A693 360deg);
    animation: viravirast-rotate infinite 1s linear;
  }

  @media screen and (max-width: 768px) {
    .viravirast-block-loading {
      width: 16px;
      height: 16px;
      left: calc(var(--left) - 12px + 50px);
      top: calc(var(--top) + 12px + 50px + 10px);
    }
  }

  @keyframes viravirast-rotate {
    from {
      transform: rotate(0deg);
    }
  
    to {
      transform: rotate(360deg);
    }
  }`;

  (head =
    iframeDocument.head || iframeDocument.getElementsByTagName("head")[0]),
    (style = iframeDocument.createElement("style"));

  head.appendChild(style);

  style.type = "text/css";
  if (style.styleSheet) {
    // This is required for IE8 and below.
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(iframeDocument.createTextNode(css));
  }
};

const addViravirastUnderlineTolerance = () => {
  const css = `
  :root{
    --viravirast-underline-tolerance: 70px;
  }`;

  (head = document.head || document.getElementsByTagName("head")[0]),
    (style = document.createElement("style"));

  head.appendChild(style);

  style.type = "text/css";
  if (style.styleSheet) {
    // This is required for IE8 and below.
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
};

// todo: support more fields
const supportedBlocks = [
  "core/paragraph",
  "core/heading",
  "core/freeform",
  "core/preformatted",
  "core/list",
  "core/list-item",
  "classic/paragraph",
];
const blocksWithChild = ["core/list"];

let viravirastTimeout = {};

const viraVirastHandleAddNewHighlight = (
  textHandler,
  preWord,
  newWord,
  index,
  blockId,
  suggestedWords,
  isClassic,
  isTitle = false,
  resultCheckWordType
) => {
  console.log("sadasdadsasdasd");

  let HTMLBlock = isTitle
    ? iframeDocument.querySelector(blockId)
    : isClassic
    ? tinymce
        .get("content")
        .getBody()
        .querySelector(`[vv="classic-${blockId}"]`)
    : iframeDocument.getElementById(`block-${blockId}`);
  // let HTMLBlock = isTitle
  //   ? iframeDocument.querySelector(blockId)
  //   : isClassic
  //   ? tinymce.get("content").getBody().querySelector(`#classic-${blockId}`)
  //   : iframeDocument.getElementById(`block-${blockId}`);
  if (!HTMLBlock) {
    console.log("ASdadsadsadsadsasd");
    return;
  }
  const textNodes = viravirastGetTextNodesIn(HTMLBlock);

  let preLength = 0;
  parentNode = HTMLBlock;
  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    // relativeTo = document.querySelector("#poststuff");
    // relativeTo = document.querySelector("#wp-content-wrap");
    let relativeTo = isClassic
      ? tinymce.get("content").getBody()
      : iframeDocument.querySelector(".editor-styles-wrapper");

    const wordPosition = viravirastFindWordPositionRelativeTo(
      node,
      parentNode,
      preWord,
      index,
      preLength,
      relativeTo,
      blockId,
      isClassic
    );
    preLength += node.nodeValue.length;
    if (!wordPosition) continue;
    if (wordPosition) {
      const left = wordPosition.left;

      const lineHeight = parseInt(
        window.getComputedStyle(HTMLBlock).lineHeight
      );
      const fontSize = parseInt(window.getComputedStyle(HTMLBlock).fontSize);
      const fontFamily = window.getComputedStyle(HTMLBlock).fontFamily;
      // const top = wordPosition.top - toolbarHeight - headerHeight - adminBarHeight - noticesDismissibleHeight - noticesPinnedHeight;
      const top = wordPosition.top;

      const width = viravirastGetWordWidth(preWord, fontSize, fontFamily);

      const id = Date.now().toString();
      const highlight = document.createElement("div");
      highlight.classList.add("viravirast-underline");
      highlight.classList.add("viravirast-error");
      if (resultCheckWordType == RESULT_CHECK_WORD_TYPES.AI) {
        highlight.classList.add("viravirast-ai");
      } else if (resultCheckWordType == RESULT_CHECK_WORD_TYPES.SUGGEST) {
        highlight.classList.add("viravirast-error-suggest");
      }
      highlight.style.setProperty("--left", `${left}px`);
      highlight.style.setProperty("--top", `${isClassic ? top : top}px`);
      highlight.style.setProperty("--lineHeight", `${lineHeight}px`);
      highlight.style.setProperty("--width", `${width}px`);
      highlight.style.setProperty("--height", `${2}px`);
      highlight.setAttribute("id", `viravirast-highlight-${id}`);
      highlight.setAttribute(
        "ondblclick",
        `viraVirastHandleToggleSuggested("${id}", ${isClassic});`
      );
      highlight.setAttribute(
        "ontouchend",
        `viraVirastHandleToggleSuggested("${id}", ${isClassic});`
      );

      const suggestList = document.createElement("div");
      suggestList.classList.add("viravirast-suggesteds");
      suggestList.style.setProperty("--left", `${left}px`);
      suggestList.style.setProperty("--lineHeight", `${lineHeight}px`);
      suggestList.style.setProperty("--top", `${isClassic ? top : top}px`);
      suggestList.setAttribute("id", `viravirast-suggesteds-${id}`);

      const titleElem = document.createElement("div");
      titleElem.classList.add("suggest-title");
      titleElem.innerHTML = "نوشتار";
      if (resultCheckWordType == RESULT_CHECK_WORD_TYPES.SPELL) {
        titleElem.innerHTML = "غلط‌یابی واژگانی";
      }
      if (resultCheckWordType == RESULT_CHECK_WORD_TYPES.GRAMMAR) {
        titleElem.innerHTML = "دستور خط";
      }
      if (resultCheckWordType == RESULT_CHECK_WORD_TYPES.SUGGEST) {
        titleElem.innerHTML = "پیشنهاد معنایی";
        titleElem.classList.add("suggest-title-suggest");
      }
      if (resultCheckWordType == RESULT_CHECK_WORD_TYPES.AI) {
        titleElem.innerHTML = "ویرایش حرفه‌ای";
        titleElem.classList.add("suggest-title-ai");
      }
      suggestList.appendChild(titleElem);

      suggestedWords.forEach((word, i) => {
        if (word.Key) {
          const elem = document.createElement("div");
          elem.classList.add("inner-suggested");
          elem.innerHTML = `<strike>${preWord}</strike> <span>${word.Key}</span>`;

          elem.setAttribute(
            "onclick",
            `viravirastReplaceTheWordAndHandlePlainToRich(this, "${id}", ${i}, ${index}, ${isClassic}, ${isTitle})`
          );
          suggestList.appendChild(elem);
        }
      });
      const ignoreElem = document.createElement("div");
      ignoreElem.classList.add("viravirast-ignore-global"); // viravirast-ignore
      ignoreElem.setAttribute("title", "نادیده گرفتن برای همیشه");
      ignoreElem.innerHTML = "نادیده گرفتن برای همیشه";
      ignoreElem.setAttribute(
        "onclick",
        `viravirastIgnoreWord(this, "${id}", "${preWord}", ${isClassic})`
      );

      const ignoreLocalElem = document.createElement("div");
      ignoreLocalElem.classList.add("viravirast-ignore-local");
      ignoreLocalElem.setAttribute("title", "نادیده گرفتن");
      ignoreLocalElem.innerHTML = "نادیده گرفتن";
      ignoreLocalElem.setAttribute(
        "onclick",
        `viravirastIgnoreWordLocal(this, "${id}", "${preWord}", ${isClassic})`
      );

      const ignoresWrapper = document.createElement("div");
      ignoresWrapper.classList.add("viravirast-ignores");
      ignoresWrapper.appendChild(ignoreLocalElem);
      ignoresWrapper.appendChild(ignoreElem);

      suggestList.appendChild(ignoresWrapper);

      if (isClassic) {
        document.querySelector("#post-body-content").appendChild(highlight);
        document.querySelector("#post-body-content").appendChild(suggestList);
      } else {
        try {
          document.querySelector(".is-desktop-preview").appendChild(highlight);
          document
            .querySelector(".is-desktop-preview")
            .appendChild(suggestList);
        } catch (e) {
          document
            .querySelector(".edit-post-visual-editor")
            .appendChild(highlight);
          document
            .querySelector(".edit-post-visual-editor")
            .appendChild(suggestList);
        }
      }

      const options = {
        id: id,
        isTitle: isTitle,
        isClassic: isClassic,
        newWord: newWord,
        index: index,
        preWord: preWord,
        textHandler: textHandler,
        blockId: blockId,
        suggestedWords: suggestedWords,
        resultCheckWordType: resultCheckWordType,
      };

      ViraVirastHighlights = [...ViraVirastHighlights, options];
      break;
    }
  }
};

const viravirastRelocateUnderlines = (isClassic) => {
  clearTimeout(viravirastTimeoutRelocate);
  isRelocating = true;
  viravirastTimeoutRelocate = setTimeout(async () => {
    let i = 0;
    ViraVirastHighlights.forEach(async (item) => {
      setTimeout(async () => {
        const isTitle = viraVirastHandleRemoveHighlightById(item.id);
        viraVirastHandleAddNewHighlight(
          item.textHandler,
          item.preWord,
          item.newWord,
          item.index,
          item.blockId,
          item.suggestedWords,
          isClassic,
          isTitle,
          item.resultCheckWordType
        );
        i++;
        if (i == ViraVirastHighlights.length) {
          isRelocating = false;
          clearTimeout(viravirastTimeoutRelocate);
        }
      }, 100);
    });
    if (ViraVirastHighlights.length == 0) {
      isRelocating = false;
      clearTimeout(viravirastTimeoutRelocate);
    }
  }, 500);
};

const viravirastCalculateIndexDifferent = (blockId, i) => {
  const indexChanges = blocksAdditionalIndexed[blockId];
  if (indexChanges) {
    let sumOfIndexesBefore = blocksAdditionalIndexed[blockId]
      .filter((item) => item.key <= i)
      .map((item) => item.value)
      .reduce((a, b) => a + b, 0);
    return sumOfIndexesBefore;
  }
  return 0;
};
const viravirastSetIndexDifferent = (blockId, i, value) => {
  const indexChanges = blocksAdditionalIndexed[blockId];
  tempIndex = {};
  tempIndex.key = i;
  tempIndex.value = value;
  if (indexChanges) {
    blocksAdditionalIndexed[blockId].push(tempIndex);
  } else {
    blocksAdditionalIndexed[blockId] = [tempIndex];
  }
};

const viravirastReplaceTheWordAndHandlePlainToRich = (
  current,
  highlightId,
  suggestIndex,
  index,
  isClassic,
  isTitle = false
) => {
  ignoreMutation = true;
  const highlight = ViraVirastHighlights.filter(
    (item) => item.id == highlightId
  )[0];

  if (!highlight) {
    console.log("not found.");
    return;
  }
  const textHandler = highlight.textHandler;
  const blockId = highlight.blockId;
  const newWord = highlight.newWord;

  // change text...
  const word = newWord.WordSuggestion[suggestIndex].Key;
  const preWord = newWord.Word;
  const theWordIndexBegin = parseInt(newWord.Index);
  const theWordIndex = theWordIndexBegin;
  // const theWordLength = word.length;
  // const theWordLength = newWord.ResultCheckWordType;

  const onlyTextsSeparated = textHandler.texts.map((txt) => txt.text);
  const text = onlyTextsSeparated.join("");

  currentCursorBegin = 0;
  currentCursorEnd = 0;
  console.log(onlyTextsSeparated);
  let processedIndex = 0;
  let additionalIndex = 0;
  onlyTextsSeparated.forEach((txt, i) => {
    currentCursorEnd += txt.length;

    // console.log("currentCursorEnd", currentCursorEnd, "currentCursorBegin", currentCursorBegin)
    // this wont work if a part of word is on the other index
    const additionalIndex = viravirastCalculateIndexDifferent(blockId, index);
    if (theWordIndex <= currentCursorEnd - additionalIndex) {
      const actualIndex = index - currentCursorBegin + additionalIndex;
      console.log(
        "index - currentCursorBegin - additionalIndex",
        index,
        currentCursorBegin,
        additionalIndex,
        actualIndex
      );
      const theText = textHandler.texts[i].text;
      const wrongWordFrom = theText.substring(actualIndex);
      const wrongWordBefore = theText.substring(actualIndex, -1);

      textHandler.texts[i].text =
        wrongWordBefore + wrongWordFrom.replace(preWord, word);
      viravirastSetIndexDifferent(blockId, index, word.length - preWord.length);

      // if (theWordLength + theWordIndex >= currentCursorEnd) {
      //   const visibleHere = theWordLength + theWordIndex - currentCursorEnd;
      //   console.log(theWordLength, theWordIndex, currentCursorEnd, currentCursorBegin, visibleHere, processedIndex);
      //   console.table({ replacing_txt: txt, "with word.slice(processedIndex, txt.length )": word.slice(processedIndex, txt.length), processedIndex: processedIndex, "txt.length": txt.length })
      //   // not replace the entire text but only the part
      //   textHandler.texts[i].text = textHandler.texts[i].text.replace(txt, word.slice(processedIndex, txt.length+processedIndex ));//??
      //   processedIndex += currentCursorEnd - theWordIndex;

      //   // theWordIndex +;
      // }
      viraVirastHandleRemoveHighlightById(highlightId, true);
      viravirastRelocateUnderlines(isClassic);
      // console.log("un ignore first")
      // ignoreMutation = false;

      return;
    }
    currentCursorBegin += txt.length;
    // console.log("un ignore second")
    // ignoreMutation = false;
  });

  textHandler.plainToRich();
  textHandler.changed;

  if (isTitle) {
    wp.data.dispatch("core/editor").editPost({ title: textHandler.changed });
  } else if (isClassic) {
    tinymce
      .get("content")
      .getBody()
      .querySelector(`[vv="classic-${blockId}"]`).innerHTML =
      textHandler.changed;
    // .querySelector(`#classic-${blockId}`).innerHTML = textHandler.changed;
  } else {
    // for core/paragraph blocks
    const attributes = {
      content: textHandler.changed,
    };
    wp.data
      .dispatch("core/block-editor")
      .updateBlockAttributes(blockId, attributes);
  }
};

let waitingBlocks = {
  // id: {...}
};

const viravirastGetBlockPosition = (block, relativeTo, isClassic, isTitle) => {
  const parentPosition = relativeTo.getBoundingClientRect();
  // let position = { left: -parentPosition.left, top: -parentPosition.top }
  if (block) {
    const rect = block.getBoundingClientRect();

    if (isClassic) {
      let difference = 0;
      let leftDifference = 0;
      try {
        difference =
          document.querySelector("#content_ifr").getClientRects()[0].top -
          document.querySelector("#edit-slug-box").getClientRects()[0].top;
        leftDifference =
          parseInt(
            window
              .getComputedStyle(document.querySelector("#wp-content-wrap"))
              .marginLeft.replace("px", "")
          ) + 2;
      } catch (e) {
        console.log(e);
      }
      return {
        left: rect.left + leftDifference + 5,
        top: rect.top + parentPosition.top + difference + 45,
      };
    } else {
      return {
        left: rect.left - parentPosition.left,
        top: rect.top - parentPosition.top,
      };
    }
    // position = {
    //   left: rect.left - parentPosition.left,
    //   top: rect.top  - parentPosition.top
    // };
  }
  return null;
};

// api loader
const viravirastRemoveWaiting = (id) => {
  iframeDocument.getElementById(`viravirast-block-loading-${id}`).remove();
  delete waitingBlocks[id];
};
const viravirastSetWaiting = (id, blockId, relativeTo, isClassic, isTitle) => {
  const block = isTitle
    ? iframeDocument.querySelector(blockId)
    : isClassic
    ? tinymce
        .get("content")
        .getBody()
        .querySelector(`[vv="classic-${blockId}"]`)
    : // ? tinymce.get("content").getBody().querySelector(`#classic-${blockId}`)
      iframeDocument.getElementById(`block-${blockId}`);

  const pos = viravirastGetBlockPosition(block, relativeTo, isClassic, isTitle);
  const left = pos.left;
  const top = pos.top;
  const highlight = document.createElement("div");
  highlight.classList.add("viravirast-block-loading");
  highlight.style.setProperty("--left", `${left}px`);
  highlight.style.setProperty("--top", `${top}px`);
  highlight.setAttribute("id", `viravirast-block-loading-${id}`);

  if (isClassic) {
    // todo: change
    document.getElementById("post-body-content").appendChild(highlight);
  } else {
    // todo: double check
    // .getElementsByClassName("is-root-container")
    iframeDocument.body.appendChild(highlight);
  }

  waitingBlocks[id] = true;
};

// ignore word
const viravirastIgnoreWord = (
  current,
  highlightId,
  wordToIgnore,
  isClassic
) => {
  viravirastIgnoreWordApi(wordToIgnore);
  // remove underline from this word
  viraVirastHandleRemoveHighlightById(highlightId, true);
  viravirastRelocateUnderlines(isClassic);
};
const viravirastIgnoreWordLocal = (
  current,
  highlightId,
  wordToIgnore,
  isClassic
) => {
  // viravirastIgnoreWordApi(wordToIgnore);
  localIgnore[wordToIgnore] = true;
  // remove underline from this word
  viraVirastHandleRemoveHighlightById(highlightId, true);
  viravirastRelocateUnderlines(isClassic);
};

// word position
const viravirastGetWordWidth = (word, fontSize, fontFamily) => {
  const span = document.createElement("span");
  span.style.visibility = "hidden";
  span.style.whiteSpace = "pre";
  // span.style.fontWeight = 'bold';
  span.style.fontFamily = fontFamily;
  span.style.fontSize = `${fontSize}px`;
  span.textContent = word;
  iframeDocument.body.appendChild(span);
  const width = span.getBoundingClientRect().width;
  iframeDocument.body.removeChild(span);
  return width;
};
const viravirastGetTextNodesIn = (element) => {
  var textNodes = [];

  function getTextNodes(node) {
    if (node.nodeType == Node.TEXT_NODE) {
      textNodes.push(node);
    } else {
      for (var i = 0; i < node.childNodes.length; i++) {
        getTextNodes(node.childNodes[i]);
      }
    }
  }

  getTextNodes(element);

  return textNodes;
};
const viravirastFindWordPositionRelativeTo = (
  node,
  parentNode,
  word,
  index,
  preLength,
  relativeTo,
  blockId,
  isClassic
) => {
  const parentPosition = relativeTo.getBoundingClientRect();
  // const words = node.nodeValue.split(' ');
  // console.log(words, word);
  // const wordIndex = words.findIndex(w => w === word);

  let searchInside = parentNode.innerText;
  // const temp = searchInside.substring(index);

  // if (temp>=0) {
  //   searchInside = node.parentNode.parentNode.innerText;
  // }

  const wordIndex = node.nodeValue.search(word);
  if (wordIndex >= 0) {
    const range = iframeDocument.createRange();
    const additionalIndex = viravirastCalculateIndexDifferent(blockId, index);
    const realIndex = index + additionalIndex;
    const wrongWordFrom = searchInside.substring(realIndex);
    const wrongWordBefore = searchInside.substring(realIndex, -1);
    let startOffset =
      wrongWordBefore.length + wrongWordFrom.indexOf(word) - preLength;
    // console.log("startOffset", startOffset);
    // console.log(node, startOffset, startOffset + word.length)
    if (startOffset < 0) {
      startOffset = wrongWordFrom.indexOf(word);
    }
    if (startOffset < 0 || startOffset > node.length) {
      return;
    }
    range.setStart(node, startOffset);
    if (startOffset + word.length - node.length > 0) {
      range.setEnd(node, node.length);
    } else {
      range.setEnd(node, startOffset + word.length);
    }
    // console.log(range.getBoundingClientRect(), parentPosition)
    const rect = range.getBoundingClientRect();
    range.detach();
    if (isClassic) {
      let difference = 0;
      let leftDifference = 0;
      try {
        difference =
          document.querySelector("#content_ifr").getClientRects()[0].top -
          document.querySelector("#edit-slug-box").getClientRects()[0].top;
        leftDifference =
          parseInt(
            window
              .getComputedStyle(document.querySelector("#wp-content-wrap"))
              .marginLeft.replace("px", "")
          ) + 2;
      } catch (e) {
        console.log(e);
      }
      return {
        left: rect.left + leftDifference,
        top: rect.top + parentPosition.top + difference + 45,
      };
    } else {
      return {
        left: rect.left - parentPosition.left,
        top: rect.top - parentPosition.top,
      };
    }
  } else {
    return null;
  }
};

const addToggler = () => {
  let togglerInterval = setInterval(() => {
    if (document.querySelector(".viravirast-toggle-wrapper")) {
      clearInterval(togglerInterval);
      return;
    }
    const togglerWrapper = document.createElement("div");
    togglerWrapper.classList.add("viravirast-toggle-wrapper");
    togglerWrapper.setAttribute("onclick", "viravirastHandleToggle(this)");
    const togglerLabel = isViravirastEnabled
      ? VIRAVIRAST_DISABLED_LABEL
      : VIRAVIRAST_ENABLED_LABEL;
    togglerWrapper.innerHTML = `<label for="viravirast-toggler">${togglerLabel}</label><input type="checkbox" name="viravirast-toggler" ${
      isViravirastEnabled ? "checked" : ""
    } >`;
    document
      .querySelector(".edit-post-header__toolbar .edit-post-header-toolbar")
      ?.appendChild(togglerWrapper);
    document
      .querySelector(".viravirast-toggler-settings")
      ?.appendChild(togglerWrapper);
    // document.querySelector(".block-editor-block-contextual-toolbar")?.appendChild(togglerWrapper)
    document
      .querySelector("#wp-content-editor-tools")
      ?.appendChild(togglerWrapper);
  }, 1000);
};

const inputEventCallback = (
  event,
  blockId,
  isClassic,
  timeout,
  isTitle = false
) => {
  if (!isViravirastEnabled) return;
  clearTimeout(viravirastTimeout[blockId]);
  if (!isClassic) {
    viraVirastHandleRemoveHighlightByBlockId(blockId);
  }
  viravirastTimeout[blockId] = setTimeout(async () => {
    if (ignoreMutation) {
      ignoreMutation = false;
      return;
    }
    if (isClassic) {
      viraVirastHandleRemoveHighlightByBlockId(blockId);
    }
    let block = null;
    let blockContent = null;
    let relativeTo = null;
    if (isTitle) {
      // blockContent = wp.data.select("core/editor").getEditedPostAttribute( 'title' )
      blockContent = iframeDocument.querySelector(
        ".editor-post-title__input"
      ).innerHTML;
      relativeTo = iframeDocument.querySelector(".editor-styles-wrapper");
    } else if (isClassic) {
      block = tinymce
        .get("content")
        .getBody()
        .querySelector(`[vv="classic-${blockId}"]`);
      // .querySelector(`#classic-${blockId}`);
      if (!block) return;
      blockContent = block.innerHTML;
      // todo the loader position
      relativeTo = tinymce.get("content").getBody();
    } else {
      block = wp.data.select("core/block-editor").getBlock(blockId);
      blockContent = block.attributes.content;
      relativeTo = iframeDocument.querySelector(".editor-styles-wrapper");
    }

    let currentParagraph = new ViravirastTextHandler(blockContent, blockId);

    currentParagraph.richToPlain();

    const text = currentParagraph.texts.map((txt) => txt.text).join("");

    // set block loading
    let waitId = Date.now();
    viravirastSetWaiting(waitId, blockId, relativeTo, isClassic, isTitle);
    const res = await viravirastValidateText(Date.now(), text, (test = false));
    blocksAdditionalIndexed[blockId] = [];
    viravirastRemoveWaiting(waitId);
    // remove block loading

    if (res?.body?.HttpStatusCode == 200) {
      // changing text
      const newWords =
        res.body.Result.EditingReturn.Changes.ResultWords.ResultWord;
      newWords.forEach((newWord) => {
        if (newWord.Index >= 0) {
          const preWord = newWord.Word;
          const suggestedWords = newWord.WordSuggestion;
          const resultCheckWordType = newWord.ResultCheckWordType;
          const index = parseInt(newWord.Index);
          if (localIgnore[preWord]) return;
          viraVirastHandleAddNewHighlight(
            currentParagraph,
            preWord,
            newWord,
            index,
            blockId,
            suggestedWords,
            isClassic,
            isTitle,
            resultCheckWordType
          );
        }
      });
    }
  }, timeout);
};

jQuery(() => {
  const $ = jQuery;

  function viravirastLostFocusHandler(e) {
    if (
      ![...document.querySelectorAll(".viravirast-suggesteds-show")].includes(
        e.target
      )
    ) {
      if (
        ![...document.querySelectorAll(".viravirast-underline")].includes(
          e.target
        )
      ) {
        // todo: check it
        $(".viravirast-suggesteds-show", document).removeClass(
          "viravirast-suggesteds-show"
        );
      }
    }
  }

  $(document).ready(() => {
    const notiContainer = document.createElement("div");
    notiContainer.id = "viravirast-noti-container";
    document.body.appendChild(notiContainer);

    // todo... only create the ViravirastTextHandler when sending api
    const registerViravirastTextHandler = (
      blockId,
      blockName,
      isClassic = false,
      isTitle = false
    ) => {
      if (supportedBlocks.includes(blockName)) {
        if (blocksWithChild.includes(blockName)) {
        } else {
          console.log(`adding input event to block ${blockId}`);
          setTimeout(async () => {
            let element;
            if (isClassic) {
              element = tinymce
                .get("content")
                .getBody()
                .querySelector(`[vv="classic-${blockId}"]`);
              // .querySelector(`#classic-${blockId}`);
              console.log(element);
              if (!element) return;
              // todo

              var observer = new MutationObserver(function (mutations) {
                inputEventCallback(
                  null,
                  blockId,
                  isClassic,
                  VIRAVIRAST_DEBOUNCE_TIMEOUT
                );
              });
              // configuration of the observer:
              var config = {
                attributes: false,
                childList: true,
                characterData: true,
                subtree: true,
              };

              // pass in the target node, as well as the observer options
              observer.observe(element, config);

              // $(element).bind("DOMSubtreeModified", (e) => {
              //   console.log("DOMSubtreeModified", blockId, e);

              //   inputEventCallback(
              //     e,
              //     blockId,
              //     isClassic,
              //     VIRAVIRAST_DEBOUNCE_TIMEOUT
              //   );
              // });
            } else {
              await vvDelay(2000);
              const iframe = document.querySelector(
                "iframe[name='editor-canvas'"
              );
              if (iframe) {
                iframeDocument =
                  iframe.contentDocument || iframe.contentWindow.document;
                addViravirastUnderlineTolerance();
                isInIframe = true;
                console.log("is in iframe");
                viraviraseAddIframeStyles();
              }

              iframeDocument.addEventListener(
                "click",
                viravirastLostFocusHandler,
                { useCapture: true }
              );

              console.log(iframeDocument.body);
              element = iframeDocument.getElementById(`block-${blockId}`);
              console.log(`block-${blockId}`);
              element.addEventListener("input", (e) =>
                inputEventCallback(
                  e,
                  blockId,
                  isClassic,
                  VIRAVIRAST_DEBOUNCE_TIMEOUT
                )
              );
            }
            // both classic and gutenberg
            element.addEventListener("dblclick", (e) => {
              console.log("dblclick on", blockId);

              inputEventCallback(e, blockId, isClassic, 1);
            });
            element.addEventListener("paste", (e) =>
              inputEventCallback(e, blockId, isClassic, 100)
            );
            var mylatesttap;
            element.addEventListener("touchend", (e) => {
              var now = new Date().getTime();
              var timesince = now - mylatesttap;
              if (timesince < 600 && timesince > 0) {
                inputEventCallback(e, blockId, isClassic, 1);
              }
              mylatesttap = new Date().getTime();
            });
          }, 100);
        }
      }

      if (isTitle) {
        // blockId is the title class here
        let element;
        element = iframeDocument.querySelector(blockId);
        element.addEventListener("input", (e) => {
          console.log("input on", blockId);

          inputEventCallback(
            e,
            blockId,
            isClassic,
            VIRAVIRAST_DEBOUNCE_TIMEOUT,
            isTitle
          );
        });
        element.addEventListener("paste", (e) => {
          inputEventCallback(e, blockId, isClassic, 100, isTitle);
        });
        element.addEventListener("dblclick", (e) => {
          console.log("dblclick on", blockId);
          inputEventCallback(e, blockId, isClassic, 0, isTitle);
        });
      }
    };

    wp?.domReady(() => {
      console.log(wp);
      if (!wp.data) return;
      if (!wp.data.select("core/block-editor")) return;

      const blocks = wp.data.select("core/block-editor").getBlocks();
      blocks.forEach((block) => {
        registerViravirastTextHandler(block.clientId, block.name);
      });

      // handling new blocks
      let previousBlocks = [];

      const getBlockCount = (blocks) => {
        let i = [];
        blocks?.forEach((block) => {
          i.push(block.clientId);
          i.push(...getBlockCount(block.innerBlocks));
        });
        return i;
      };

      const handleBlockChanges = () => {
        const previousBlockCount = previousBlocks.length;
        const blocks = getBlockCount(
          wp.data.select("core/block-editor").getBlocks()
        );
        // const blocks = wp.data.select('core/block-editor').getBlockOrder();
        const blockCount = blocks.length;

        if (blockCount > previousBlockCount) {
          const newBlockIds = blocks.filter(
            (blk) => !previousBlocks.includes(blk)
          );
          newBlockIds.forEach((newBlockId) => {
            console.log("New block ID:", newBlockId);
            const newBlock = wp.data
              .select("core/block-editor")
              .getBlock(newBlockId);
            if (supportedBlocks.includes(newBlock.name)) {
              console.log(newBlockId);
              registerViravirastTextHandler(newBlockId, newBlock.name);
            }
          });
        } else if (blockCount < previousBlockCount) {
          const removedBlockId = previousBlocks.filter(
            (blk) => !blocks.includes(blk)
          )[0];
          console.log("Removed block ID:", removedBlockId);
        }

        previousBlocks = blocks;
      };

      wp.data.subscribe(handleBlockChanges);

      let resizeIntervalCount = 0;
      let resizeInterval = setInterval(() => {
        if (resizeIntervalCount > 10) {
          clearInterval(resizeInterval);
        }
        resizeIntervalCount++;
        try {
          new ResizeObserver(function () {
            console.log("editor resized");
            viravirastRelocateUnderlines(false);
            addToggler();
          }).observe(
            document.getElementsByClassName(
              // original doc
              "interface-interface-skeleton__content"
            )[0]
          );
          clearInterval(resizeInterval);
        } catch (e) {
          console.log(e);
        }
      }, 500);
    }); // wp blocks ready

    let title;
    // handle title
    // wp.data.dispatch( 'core/editor' ).editPost( { title: 'This is the post title' } );

    const titleInterval = setInterval(() => {
      title = iframeDocument.querySelector(".editor-post-title__input");
      if (title) {
        registerViravirastTextHandler(
          ".editor-post-title__input",
          "Title",
          false,
          true
        );
        clearInterval(titleInterval);
      }
    }, 1000);
    // wp-content-wrap
    // wp-core-ui wp-editor-wrap has-dfw tmce-active
    // wp-core-ui wp-editor-wrap has-dfw html-active

    // todo support multiple editors in one page...
    if (
      typeof tinymce !== "undefined" &&
      tinymce.get("content") &&
      tinymce.get("content").id === "content"
    ) {
      let isEditorInitialized = false;
      tinymce.init({
        selector: "textarea",
        plugins: "paste",
        paste_as_text: true,
        paste_text_sticky: true,
        paste_text_sticky_default: true,
        // valid_elements: "p,br,b,i,strong,em,a,h1,h2,h3,h4,h5,h6,blockquote", // or your specific selector
        setup: function (editor) {
          // editor.onInit.add(function (editor) {
          //   editor.pasteAsPlainText = true;
          // });
          try {
            tinymce.activeEditor.plugins.paste.clipboard.pasteFormat.set(
              "text"
            );
          } catch (e) {
            console.log(e);
          }
          if (!isEditorInitialized) {
            editor.on("init", function () {
              // editor.execCommand("mceTogglePlainTextPaste");
              // Editor is fully initialized, you can now access its body
              try {
                editor.plugins.paste.clipboard.pasteFormat.set("text");
                console.log(editor.paste);
                console.log(tinymce.activeEditor);
              } catch (e) {
                console.log(e);
              }
              editorTemp = editor;
              // start adding listeners...
              let tags = [
                "p",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "div",
                "ul",
                "ol",
                "blockquote",
              ];
              let paragraphs = [];

              tags.forEach((tag) => {
                const selectedTags = tinymce
                  .get("content")
                  .getBody()
                  .getElementsByTagName(tag);
                if (selectedTags) {
                  paragraphs = [...paragraphs, ...selectedTags];
                }
              });

              let i = 0;
              paragraphs &&
                [...paragraphs].map((paragraph) => {
                  i++;
                  const id = `${Date.now()}${i}`;
                  setVVAttr(paragraph, `classic-${id}`);
                  registerViravirastTextHandler(id, "classic/paragraph", true);
                });
              // end adding listeners...

              new ResizeObserver(function () {
                console.log("editor resized");
                viravirastRelocateUnderlines(true);
                addToggler();
              }).observe(document.querySelector("#wp-content-wrap"));

              // handle adding new paragraph
              const editorContent = tinymce.get("content").getBody();
              const observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                  let j = 0;
                  // if (mutation.type === 'childList' && mutation.addedNodes.length > 0 && tags.includes(mutation.target.nodeName.toLowerCase())) {
                  mutation.addedNodes.forEach(async (addedNode) => {
                    j++;

                    if (
                      mutation.type === "childList" &&
                      // mutation.addedNodes.length > 0 &&
                      tags.includes(addedNode?.nodeName.toLowerCase())
                    ) {
                      // console.log("add: ", mutation, mutation.target.id)
                      const id = `${Date.now()}${j}`;
                      setVVAttr(addedNode, `classic-${id}`);
                      registerViravirastTextHandler(
                        id,
                        "classic/paragraph",
                        true
                      );
                      // } else if(mutation.type === 'childList' && mutation.removedNodes.length > 0 && tags.includes(mutation.target.nodeName.toLowerCase()) ){
                    } else if (
                      mutation.type === "childList" &&
                      mutation.removedNodes.length > 0 &&
                      tags.includes(addedNode?.nodeName.toLowerCase())
                    ) {
                      // console.log("removed: ", mutation, mutation.target.id)
                      console.log("removed: ", mutation, addedNode.id);
                    }
                  });
                });
              });

              // Start observing changes to the editor content
              observer.observe(editorContent, {
                childList: true,
                subtree: false,
              });
              console.log(editor.getBody());
              tinymce
                .get("content")
                .getBody()
                .addEventListener(
                  "click",
                  function (e) {
                    if (
                      ![
                        ...document.querySelectorAll(
                          ".viravirast-suggesteds-show"
                        ),
                      ].includes(e.target)
                    ) {
                      if (
                        ![
                          ...document.querySelectorAll(".viravirast-underline"),
                        ].includes(e.target)
                      ) {
                        // todo
                        jQuery(".viravirast-suggesteds-show").removeClass(
                          "viravirast-suggesteds-show"
                        );
                      }
                    }
                  },
                  { useCapture: true }
                );
            });
            isEditorInitialized = true;
          }
        },
      });
    }
    document.addEventListener("click", viravirastLostFocusHandler, {
      useCapture: true,
    });
    addToggler();
  }); // dom ready
}); //jquert
