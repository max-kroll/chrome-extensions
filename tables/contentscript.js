var tgTable;
var tgCell;

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.type) {
		case "install":
			install();
			break;
		case "uninstall":
			uninstall();
			break;
		case "select":
			pseudoSelectColumn(tgTable, tgCell.cellIndex);
			break;
		case "sort":
			sortTable(tgTable, tgCell.cellIndex, message.sortDirection == "asc");
			break;
		case "copy":
			copyTable(tgTable);
			break;
	}
	sendResponse({});
});

/*
 * visual (un)select table column
 */
function pseudoSelectColumn(table, colIndex, selected) {
	for(var i = 0; i < table.tBodies.length; i++) {
		var rows = table.tBodies[i].rows;

		for(var j = 0; j < rows.length; j++) {
			rows[j].cells[colIndex].classList.toggle("tb-col-sel", selected);
		}
	}	
}

/*
 * sort table body rows
 */
function sortBody(body, colIndex, forward) {
	var rows = body.rows;
	var rowsArr = [];
	var rowsArrSorted;

	for(var i = 0; i < rows.length; i++) {
		rowsArr.push({
			index: i,
			value: rows[i].cells[colIndex].innerText
		});
	}

	rowsArrSorted = rowsArr.sort(function (a, b) {
		return (forward) ? a.value > b.value : b.value > a.value;
	});

	var container = document.createElement("div");

	for(var i = 0; i < rowsArrSorted.length; i++) {
		container.appendChild(rows[rowsArrSorted[i].index].cloneNode(true));
	}

	body.innerHTML = "";
	body.innerHTML = container.innerHTML;

	container.remove();
}

/*
 * sort all table rows
 */
function sortTable(table, colIndex, forward) {
	for(var i = 0; i < table.tBodies.length; i++) {
		sortBody(table.tBodies[i], colIndex, forward);
	}
	table.setAttribute("data-sorted-col", colIndex);
	table.setAttribute("data-sorted-dir", (forward) ? "asc" : "desc");
}

/*
 * get parent table and cell for target element
 */
function getTargetTable(target) {
	var targetTag;

	do {
		targetTag = target.tagName.toUpperCase();
		if(targetTag == "TD") {
			tgCell = target;
			tgTable = target.offsetParent;
			return true;
		}
		else {
			target = target.parentNode;
		}
	}
	while(targetTag && targetTag != "BODY");
	return false;
}

/*
 * return content of selected body columns
 */
function getBodySelected(body) {
	var rows = body.rows;
	var content = "";
	
	for(var i = 0; i < rows.length; i++) {
		var cells = rows[i].cells;

		for(var j = 0; j < cells.length; j++) {
			if(cells[j].classList.contains("tb-col-sel")) {
				content += cells[j].innerText + "\t";
			}
		}
		content = content.trim() + "<br>";
	}
	return content;
}

/*
 * copy content of selected columns to clipboard
 */
function copyTable(table) {
	var container = document.createElement("div");

	container.id = "newCol";

	for(var i = 0; i < table.tBodies.length; i++) {
		container.innerHTML += getBodySelected(table.tBodies[i]);
	}

	document.body.appendChild(container);

	var range = new Range();
	range.selectNode(container);
	var sel = document.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
	
	document.execCommand("copy");

	container.remove();
}

function onBodyMouseOver(e) {
	var isTD = getTargetTable(e.target);
	var direction = "asc";
	var cellSelected = false;
	var tableSelected = false;

	if(isTD) {
		if(tgTable.getAttribute("data-sorted-col") == tgCell.cellIndex
			&& tgTable.getAttribute("data-sorted-dir") == "asc") {
			direction = "desc";
		}
		cellSelected = tgCell.classList.contains("tb-col-sel");
		tableSelected = tgTable.getElementsByClassName("tb-col-sel").length > 0;
	}

	chrome.runtime.sendMessage("", {
		type: "updateMenu",
		enabled: isTD,
		sortDirection: direction,
		cellSelected: cellSelected,
		tableSelected: tableSelected
	}, null, function() {});
}

function onTableDblClick(e) {
	if(e.ctrlKey) {
		pseudoSelectColumn(tgTable, tgCell.cellIndex);
	}
}

/*
 * install document tables hooks
 */
function install() {
	var tables = document.getElementsByTagName("table");

	document.body.addEventListener("mouseover", onBodyMouseOver);
	for(var i = 0; i < tables.length; i++) {
		tables[i].addEventListener("dblclick", onTableDblClick);
	}
}

/*
 * uninstall document tables hooks
 */
function uninstall() {
	var tables = document.getElementsByTagName("table");

	document.body.removeEventListener("mouseover", onBodyMouseOver);
	for(var i = 0; i < tables.length; i++) {
		tables[i].removeEventListener("dblclick", onTableDblClick);
	}

	var selCells = document.querySelectorAll(".tb-col-sel");
	
	for(var i = 0; i < selCells.length; i++) { 
		selCells[i].classList.remove("tb-col-sel");
	}
}
