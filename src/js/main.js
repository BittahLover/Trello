"use strict";

/* <=================================== Elements / Variables ===================================> */
const e_mainContainer = document.getElementById('main-container');
const e_cardsContainer = document.getElementById('cards-container');

const e_sidebar = document.getElementById('sidebar');
const e_sidebarButton = document.getElementById('sidebar-button');
const e_sidebarClose = document.getElementById('sidebar-close');

const e_addCardText = document.getElementById('add-card-text');
const e_addCardButton = document.getElementById('add-card-button');

const e_boardsList = document.getElementById('boards-list');
const e_addBoardText = document.getElementById('add-board-text');
const e_addBoardButton = document.getElementById('add-board-button');

const e_saveButton = document.getElementById('save-button');
const e_settingsButton = document.getElementById('settings-button');
const e_deleteButton = document.getElementById('delete-button');

const e_cardContextMenu = document.getElementById('card-context-menu');
const e_cardContextMenuDelete = document.getElementById('card-context-menu-delete');
const e_cardContextMenuClear = document.getElementById('card-context-menu-clear');

const e_title = document.getElementById('title');

let appData = {
    'boards': [],
    'currentBoard': 0,
    'identifier': 0
};


function currentCards() {
    return appData.boards[appData.currentBoard].cards;
}

function currentBoard() {
    return appData.boards[appData.currentBoard];
}

/* <=================================== Extensions ===================================> */
Array.prototype.move = function(from, to) {

    this.splice(to, 0, this.splice(from, 1)[0]);
};

Array.prototype.insert = function(index, item) {

    this.splice( index, 0, item );
};

/* <=================================== Utility Functions ===================================> */
function uniqueID() {
    appData.identifier += 1;
    return 'b' + appData.identifier;
}

function getMouseOverCard() {
    return document.querySelectorAll('.parent-card:hover')[0];
}

function getMouseOverItem() {
    return document.querySelectorAll('.parent-card > ul > li:hover')[0];
}

function getItemFromElement(element) {

    for (let _card of currentCards()) {
        for (let _item of _card.items) {
            if (_item.id === element.id) {
                return _item;
            }
        }
    }
}

function getCardFromElement(element) {

    return currentCards().find(e => e.id === element.id);
}

function getBoardFromId(id) {

    return appData.boards.find(_b => _b.id === id);
}

function listBoards() {

    e_boardsList.innerHTML = '';
    for (let _board of appData.boards) {
        let _boardTitle = document.createElement('li');
        _boardTitle.innerText = _board.name;
        _boardTitle.id = _board.id;
        if (_board.id === currentBoard().id) _boardTitle.classList.add('is-active');
        _boardTitle.addEventListener('click', () => {
            renderBoard(_board);
            listBoards();
        });
        e_boardsList.appendChild(_boardTitle);
    }
}

function renderBoard(board) {
    clearData();
    appData.currentBoard = appData.boards.indexOf(board);
    document.title = 'Trello | ' + currentBoard().name;
    e_title.innerText = currentBoard().name;
    renderCards();
}

function renderCards() {

    for (let _card of e_cardsContainer.querySelectorAll('.parent-card')) {

        _card.remove();
    }
    for (let _card of currentCards()) {
        let _generated = _card.renderCard();
        e_cardsContainer.insertBefore(_generated, e_cardsContainer.childNodes[e_cardsContainer.childNodes.length - 2]);
        _card.update();
    }
}

function toggleHoverStyle(show) {

    if (show) {

        let _hoverStyle = document.createElement('style');
        _hoverStyle.id = "dragHover";

        _hoverStyle.innerHTML = ".parent-card:hover {background-color: #c7cbd1;}.parent-card > ul > li:hover {background-color: #d1d1d1;}";
        document.body.appendChild(_hoverStyle);
    } else {

        let _hoverStyle = document.getElementById('dragHover');
        _hoverStyle.parentNode.removeChild(_hoverStyle);
    }
}

function addBoard() {

    let _boardTitle = e_addBoardText.value;
    if (!_boardTitle) return alert("Type a name for the board!");
    if (appData.boards.length >= 512) return alert("Max limit for boards reached.")
    e_addBoardText.value = '';

    let _newBoard = new Board(_boardTitle, uniqueID());
    appData.boards.push(_newBoard);
    listBoards();
}

/* <=================================== Classes ===================================> */
class Item {

    constructor(title, id, parentCardId) {
        this.title = title;
        this.id = id;
        this.isDone = false;
        this.parentCardId = parentCardId;
    }

    getParentCard() {
        return document.getElementById(this.parentCardId);
    }

    check(chk=true) {
        this.isDone = chk;
        if (chk) {

            document.getElementById(this.id).style.textDecoration = 'line-through';
        } else {

            document.getElementById(this.id).style.textDecoration = 'none';
        }
    }

    update() {
        let _element = document.getElementById(this.id);

        _element.getElementsByTagName('p')[0].addEventListener('click', () => {
            if (this.isDone) {
                this.check(false);
            } else {
                this.check(true);
            }
        });

        _element.addEventListener('mousedown', cardDrag_startDragging, false);
        this.check(this.isDone);
    }
}

class Card {

    constructor(name, id, parentBoardId) {
        this.name = name;
        this.items = [];
        this.id = id;
        this.parentBoardId = parentBoardId;
    }

    addItem(item) {
        this.items.push(item);
        renderCards();
    }

    removeItem(item) {
        this.items = this.items.filter(val => val !== item);
        renderCards();
    }

    update() {
        for (let _item of this.items) {
            _item.update();
        }
    }

    renderItems() {
        let _newItemList = document.createElement('ul');
        _newItemList.id = this.id + '-ul';
        for (let _item of this.items) {
            let _newItem = document.createElement('li');
            _newItem.id = _item.id;

            let _newItemTitle = document.createElement('p');
            _newItemTitle.innerText = _item.title;
            _newItemTitle.classList.add('item-title', 'text-fix', 'unselectable');

            let _newItemButtons = document.createElement('span');

            let _newItemEditButton = document.createElement('i');
            _newItemEditButton.ariaHidden = true;
            _newItemEditButton.classList.add('fa', 'fa-pencil');
            _newItemEditButton.addEventListener('click', () => {

                let _input = document.createElement('textarea');
                _input.value = _newItemTitle.textContent;
                _input.classList.add('item-title');
                _input.maxLength = 256;
                _newItemTitle.replaceWith(_input);

                let _save = () => {
                    _item.title = _input.value;
                    renderCards();
                };

                _input.addEventListener('blur', _save, {
                    once: true,
                });
                _input.focus();
            });

            let _newItemDeleteButton = document.createElement('i');
            _newItemDeleteButton.ariaHidden = true;
            _newItemDeleteButton.classList.add('fa', 'fa-trash');
            _newItemDeleteButton.addEventListener('click', () => {
                this.removeItem(_item);
            });

            _newItemButtons.appendChild(_newItemEditButton);
            _newItemButtons.appendChild(_newItemDeleteButton);


            _newItem.appendChild(_newItemTitle);
            _newItem.appendChild(_newItemButtons);
            _newItemList.appendChild(_newItem);
        }

        return _newItemList;
    }

    renderCard() {


        let _newCardHeader = document.createElement('span');
        let _newCardHeaderTitle = document.createElement('h2');
        _newCardHeaderTitle.id = this.id + '-h2';
        _newCardHeaderTitle.innerText = this.name;
        _newCardHeaderTitle.classList.add('text-fix', 'card-title');

        _newCardHeaderTitle.addEventListener('click', (e) => {
            let _input = document.createElement('input');
            _input.value = _newCardHeaderTitle.textContent;
            _input.classList.add('card-title');
            _input.maxLength = 128;
            _newCardHeaderTitle.replaceWith(_input);

            let _save = () => {
                this.name = _input.value;
                renderCards();
            };

            _input.addEventListener('blur', _save, {
                once: true,
            });
            _input.focus();
        });

        let _newCardHeaderMenu = document.createElement('i');
        _newCardHeaderMenu.ariaHidden = true;
        _newCardHeaderMenu.classList.add("fa", "fa-bars");
        _newCardHeader.append(_newCardHeaderTitle);
        _newCardHeader.append(_newCardHeaderMenu);
        _newCardHeaderMenu.addEventListener('click', cardContextMenu_show);

        let _newInput = document.createElement('input');
        _newInput.id = this.id + '-input';
        _newInput.maxLength = 256;
        _newInput.type = 'text';
        _newInput.name = "add-todo-text";
        _newInput.placeholder = "Add Task...";
        _newInput.addEventListener('keyup', (e) => {
            if (e.code === "Enter") _newButton.click();
        });

        let _newButton = document.createElement('button');
        _newButton.id = this.id + '-button';
        _newButton.classList.add("plus-button");
        _newButton.innerText = '+';
        _newButton.addEventListener('click', () => {
            let _inputValue = _newInput.value;
            if (!_inputValue) return alert("Type a name for the item!");
            let _item = new Item(_inputValue, null, getBoardFromId(this.parentBoardId).uniqueID(), this.id);
            this.addItem(_item);
            _newInput.value = '';
            _newInput.focus();
        });

        let _newCard = document.createElement('div');
        _newCard.id = this.id;
        _newCard.classList.add('parent-card');
        _newCard.appendChild(_newCardHeader);

        if (this.items) {

            let _newItemList = this.renderItems();

            _newCard.appendChild(_newItemList);
        }

        _newCard.appendChild(_newInput);
        _newCard.appendChild(_newButton);

        return _newCard;
    }
}

class Board {

    constructor(name, id, settings, identifier=0) {
        this.name = name;
        this.id = id;
        this.settings = settings;
        this.cards = [];
        this.identifier = identifier;
    }

    uniqueID() {
        this.identifier += 1;
        return 'e' + this.identifier.toString();
    }

    addCard() {
        let _cardTitle = e_addCardText.value;
        e_addCardText.value = '';

          if (!_cardTitle) _cardTitle = `Untitled Card ${this.cards.length + 1}`;

        let _card = new Card(_cardTitle, this.uniqueID(), this.id);
        this.cards.push(_card);

        let _newCard = _card.renderCard();
        e_cardsContainer.insertBefore(_newCard, e_cardsContainer.childNodes[e_cardsContainer.childNodes.length - 2]);
    }
}

/* <=================================== Items Drag n' Drop ===================================> */
var cardDrag_mouseDown = false;
var cardDrag_mouseDownOn = null;

const cardDrag_update = (e) => {

    if (!cardDrag_mouseDown && !cardDrag_mouseDownOn) return;

    cardDrag_mouseDownOn.style.left = e.pageX + 'px';
    cardDrag_mouseDownOn.style.top = e.pageY + 'px';
};

const cardDrag_startDragging = (e) => {


    if (e.target.tagName !== 'LI') return;

    cardDrag_mouseDown = true;
    cardDrag_mouseDownOn = e.target;

    cardDrag_mouseDownOn.style.position = 'absolute';

    toggleHoverStyle(true);
};

const cardDrag_stopDragging = (e) => {

    if (!cardDrag_mouseDown) return;

    toggleHoverStyle(false);

    let _hoverCard = getMouseOverCard();
    if (_hoverCard) {
        let _hoverItem = getMouseOverItem();

        let _hoverCardObject = getCardFromElement(_hoverCard);
        let _heldItemObject = getItemFromElement(cardDrag_mouseDownOn);

        if (_hoverCard === _heldItemObject.getParentCard()) {

            if (_hoverItem) {

                if (_hoverItem !== cardDrag_mouseDownOn) {
                  let _hoverItemObject = getItemFromElement(_hoverItem);
                    _hoverCardObject.items.move(_hoverCardObject.items.indexOf(_heldItemObject), _hoverCardObject.items.indexOf(_hoverItemObject));
                }
            }
        } else {

            if (_hoverItem) {

                if (_hoverItem !== cardDrag_mouseDownOn) {

                    let _hoverItemObject = getItemFromElement(_hoverItem);
                    let _hoverItemParentObject = getCardFromElement(_hoverItemObject.getParentCard());

                      _hoverItemParentObject.items.insert(_hoverItemParentObject.items.indexOf(_hoverItemObject), _heldItemObject);

                    getCardFromElement(_heldItemObject.getParentCard()).removeItem(_heldItemObject);
                    _heldItemObject.parentCardId = _hoverItemParentObject.id;
                }
            } else {
                _hoverCardObject.items.push(_heldItemObject);

                getCardFromElement(_heldItemObject.getParentCard()).removeItem(_heldItemObject);
                _heldItemObject.parentCardId = _hoverCardObject.id;
            }
        }
        renderCards();
    }
    cardDrag_mouseDown = false;
    cardDrag_mouseDownOn.style.position = 'static';
    cardDrag_mouseDownOn = null;
};

e_mainContainer.addEventListener('mousemove', cardDrag_update);
e_mainContainer.addEventListener('mouseleave', cardDrag_stopDragging, false);
window.addEventListener('mouseup', cardDrag_stopDragging, false);

/* <=================================== Drag Scrolling ===================================> */

let scroll_mouseDown = false;
let scroll_startX, scroll_scrollLeft;

const scroll_startDragging = (e) => {
    scroll_mouseDown = true;
    scroll_startX = e.pageX - e_mainContainer.offsetLeft;
    scroll_scrollLeft = e_mainContainer.scrollLeft;
};

const scroll_stopDragging = (e) => {
    scroll_mouseDown = false;
};

const scroll_update = (e) => {
    e.preventDefault();
    if(!scroll_mouseDown || cardDrag_mouseDown) return;

    let _scroll = (e.pageX - e_mainContainer.offsetLeft) - scroll_startX;
    e_mainContainer.scrollLeft = scroll_scrollLeft - _scroll;
};

e_mainContainer.addEventListener('mousemove', scroll_update);
e_mainContainer.addEventListener('mousedown', scroll_startDragging, false);
e_mainContainer.addEventListener('mouseup', scroll_stopDragging, false);
e_mainContainer.addEventListener('mouseleave', scroll_stopDragging, false);


/* <=================================== Card Context Menu ===================================> */


let cardContextMenu_currentCard;
const cardContextMenu_show = (e) => {

    cardContextMenu_currentCard = getMouseOverCard();

    const { clientX: mouseX, clientY: mouseY } = e;
    e_cardContextMenu.style.top = mouseY + 'px';
    e_cardContextMenu.style.left = mouseX + 'px';

    e_cardContextMenu.classList.remove('visible');
    setTimeout(() => {
        e_cardContextMenu.classList.add('visible');
    });

};

const cardContextMenu_hide = (e) => {
    if (e.target.offsetParent != e_cardContextMenu && e_cardContextMenu.classList.contains('visible')) {
        e_cardContextMenu.classList.remove("visible");
    }
};

const cardContextMenu_clearCard = () => {
    let _currentCardObject = getCardFromElement(cardContextMenu_currentCard);

    _currentCardObject.items.length = 0;
    renderCards();
};

const cardContextMenu_deleteCard = () => {
    let _currentCardObject = getCardFromElement(cardContextMenu_currentCard);

    currentCards().splice(currentCards().indexOf(_currentCardObject), 1);
    cardContextMenu_hide({target:{offsetParent:'n/a'}});

    renderCards();
}


document.body.addEventListener('click', cardContextMenu_hide);
e_cardContextMenuClear.addEventListener('click', cardContextMenu_clearCard);
e_cardContextMenuDelete.addEventListener('click', cardContextMenu_deleteCard);

/* <=================================== Data Storage ===============================================> */
function saveData() {
    window.localStorage.setItem('appData', JSON.stringify(appData));
}

function loadData() {
    let _data = window.localStorage.getItem('appData');
    if (_data) {
        let _appData = JSON.parse(_data);

        appData.currentBoard = _appData.currentBoard;
        appData.identifier = _appData.identifier;

        for (let _board of _appData.boards) {
            let _newBoard = new Board(_board.name, _board.id, _board.settings, _board.identifier);

            for (let _card of _board.cards) {
                let _newCard = new Card(_card.name, _card.id, _board.id);

                for (let _item of _card.items) {
                    let _newItem = new Item(_item.title, _item.description, _item.id, _card.id);
                    _newCard.items.push(_newItem);
                }
                _newBoard.cards.push(_newCard);
            }
            appData.boards.push(_newBoard);
        }

        renderBoard(appData.boards[appData.currentBoard]);
    } else {
        let _defaultBoard = new Board("Untitled Board", 'b0');
        appData.boards.push(_defaultBoard);
    }
    listBoards();
}

function clearData() {
    window.localStorage.clear();
}

loadData();

/* <=================================== Other Events ===================================> */
e_addCardText.addEventListener('keyup', (e) => {
    if (e.code === "Enter") currentBoard().addCard();
});

e_addCardButton.addEventListener('click', () => currentBoard().addCard());

e_addBoardText.addEventListener('keyup', (e) => {
    if (e.code === "Enter") addBoard();
});

e_addBoardButton.addEventListener('click', addBoard);


e_saveButton.addEventListener('click', () => {saveData(); alert("Data successfully saved.")});

e_deleteButton.addEventListener('click', () => {

    let _boardName = currentBoard().name;

    appData.boards.splice(appData.currentBoard, 1);
    if (appData.boards.length === 0) {
        let _defaultBoard = new Board("Untitled Board", 'b0', {'theme': null});
        appData.boards.push(_defaultBoard);
        appData.currentBoard = 0;
    } else {
        appData.currentBoard--;
    }
    listBoards();
    renderBoard(appData.boards[0]);

    alert(`Deleted board "${_boardName}"`)
});

/* <=================================== Sidebar ===================================> */
function toggleSidebar() {
    if (('toggled' in e_sidebar.dataset)) {
        delete e_sidebar.dataset.toggled;
        e_sidebar.style.width = "0";
    } else {
        e_sidebar.dataset.toggled = '';
        e_sidebar.style.width = "250px";
    }
}

e_sidebarButton.addEventListener('click', toggleSidebar);
e_sidebarClose.addEventListener('click', toggleSidebar);
