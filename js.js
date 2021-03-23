var lists = []
var listsContainer = document.getElementById('listsContainer')
var backgroundImages = []
var recentSearches = JSON.parse(localStorage.getItem('myHomePage.recentSearches')) || []
var searchList = ['Nature', 'Cars', 'City', 'Rain', 'Sunset', 'Ocean', 'Islands', 'Birds', 'Snow', 'Mountain', 'Hill', 'River', 'Waterfall', 'Galaxy', 'Stars', 'Moon', 'Sky']
var search = searchList[Math.floor(Math.random() * searchList.length)]
var isWideScreen = window.innerWidth > window.innerHeight
var random = Math.floor(Math.random() * backgroundImages.length)
var imageInUse

document.body.onresize = () => {
	let oldValue = isWideScreen
	if (isWideScreen && window.innerWidth < window.innerHeight)
		isWideScreen = false
	if (!isWideScreen && window.innerWidth > window.innerHeight)
		isWideScreen = true

	if (oldValue != isWideScreen) {
		document.body.style.background = `url(${ isWideScreen ? imageInUse.src.landscape : imageInUse.src.portrait })`
		document.body.style.backgroundRepeat = 'no-repeat'
		document.body.style.backgroundColor = "#101010"
		document.body.style.backgroundSize = "cover"
		document.body.style.backgroundPosition = 'center'
		document.body.style.backgroundAttachment = 'fixed'
	}
}

if (!localStorage.getItem('myHomePage.backgroundImages')) {

	while (recentSearches.find(s => s == search)) {
		search = searchList[Math.floor(Math.random() * searchList.length)]
	}
	recentSearches.push(search)
	if (recentSearches.length == searchList.length) {
		recentSearches = []
		localStorage.removeItem('myHomePage.recentSearches')
	}
	else {
		localStorage.setItem('myHomePage.recentSearches', JSON.stringify(recentSearches))
	}
	// console.log('Pesquisa: ', search)

	getImagesFromPexels()

	//GOOGLE
	// let script = document.createElement('script')
	// script.src = `https://www.googleapis.com/customsearch/v1?searchType=image&q=${ window.innerWidth > window.innerHeight ? 'wide+' : '' }${ search }+background&rights=cc_noncommercial&imgSize=XXLARGE&imgType=photo&callback=getBackgroundImages&key=AIzaSyDYrgmw2FfsFIbowl_8bJYTl4umuQCtv84&cx=5fc4b6eacb628da8f`
	// document.getElementsByTagName('head')[0].appendChild(script)
}
else {
	// console.log('Pegando links do armazenamento local')
	try {
		let photos = JSON.parse(localStorage.getItem('myHomePage.backgroundImages'))
		photos.map((photo) => {
			backgroundImages.push(photo)
		})
		setBackgroundImage()
	}
	catch {
		localStorage.removeItem('myHomePage.backgroundImages')
		getImagesFromPexels()
	}
}

function getImagesFromPexels() {
	backgroundImages = []
	fetch(`https://api.pexels.com/v1/search?query=${ search }&per_page=80&size=small&orientation=${ isWideScreen ? 'landscape' : 'portrait' }`, {
		headers: {
			Authorization: "563492ad6f91700001000001aad794b0b91340189909ea050f967cab"
		}
	})
		.then((res) => {
			return res.json()
		})
		.then(async (res) => {
			// console.log('retorno do Pexels: ',res)
			if (res.photos) {
				// res.photos.map((photo) => {
				// 	backgroundImages.push(photo)
				// })
				for (let i = 0; i < 3; i++) {
					let photo = res.photos[Math.floor(Math.random() * res.photos.length)]
					// console.log(photo)
					while (backgroundImages.find(image => image.id == photo.id)) {
						photo = res.photos[Math.floor(Math.random() * res.photos.length)]
					}
					backgroundImages.push(photo)
				}
				// console.log(backgroundImages)
				setBackgroundImage()
			}
		})
}

function getBackgroundImages(res) {
	// console.log('Retorno do google: ', res)
	if (res.items) {
		res.items.map((photo) => {
			backgroundImages.push(photo.link)
		})
		setBackgroundImage()
	}
}

function setBackgroundImage() {
	// console.log('Setando imagem de fundo.')
	// let section = document.getElementById('section')
	random = Math.floor(Math.random() * backgroundImages.length)
	document.getElementById('photoLink').href = backgroundImages[random].url
	document.getElementById('photographerLink').href = backgroundImages[random].photographer_url
	document.getElementById('photographerName').innerText = backgroundImages[random].photographer
	// document.body.style.background = `url(${ backgroundImages[random].src.original })`
	document.body.style.background = `url(${ isWideScreen ? backgroundImages[random].src.landscape : backgroundImages[random].src.portrait })`
	document.body.style.backgroundRepeat = 'no-repeat'
	document.body.style.backgroundColor = "#101010"
	document.body.style.backgroundSize = "cover"
	document.body.style.backgroundPosition = 'center'
	document.body.style.backgroundAttachment = 'fixed'
	// console.log('backgroundImages: ',backgroundImages)
	imageInUse = backgroundImages[random]
	backgroundImages.splice(random, 1)
	if (backgroundImages.length > 0)
		localStorage.setItem('myHomePage.backgroundImages', JSON.stringify(backgroundImages))
	else
		localStorage.removeItem('myHomePage.backgroundImages')
}

document.oncontextmenu = (e) => {
	e.preventDefault()
}

document.getElementById('searchInput').onkeydown = (e) => {
	if (e.key == "Enter")
		searchSubmit()
}

document.getElementById('editItemInputs').onkeydown = (e) => {
	if (e.key == "Enter") {
		saveEditingItem()
	}
	if (e.key == "Escape") {
		hideItemEdition()
	}
}

function searchSubmit() {
	let search = document.getElementById('searchInput').value
	if (search.trim() !== '')
		location.href = `http://google.com/search?q=${ search }`
}

function getLists() {
	if (localStorage.getItem('myHomePage.lists')) {
		lists = []
		listsContainer.innerHTML = ''
		lists = JSON.parse(localStorage.getItem('myHomePage.lists')) || []
		if (lists.length > 0) {
			lists.map((list) => {
				let listLi = document.createElement('li')
				listLi.classList.add('list')
				listLi.oncontextmenu = (e) => {
					if (!e.target.classList.contains('item') && !e.target.parentElement.classList.contains('item')) {
						let contextMenu = document.getElementById('contextMenu')
						contextMenu.innerHTML = ''
						let contextMenuItem = document.createElement('li')
						contextMenuItem.classList.add('contextMenuItem')
						contextMenuItem.innerText = "Excluir Lista"
						contextMenuItem.onclick = () => {deleteList(list.id)}
						contextMenu.appendChild(contextMenuItem)
						contextMenu.style.left = (e.clientX + 200 > window.innerWidth ? window.innerWidth - 200 : e.clientX) + 'px'
						contextMenu.style.top = (e.clientY + window.scrollY) + 'px'
						contextMenu.style.display = 'block'
						contextMenu.focus()
					}
				}
				let fieldset = document.createElement('fieldset')
				let legend = document.createElement('legend')
				let titleInput = document.createElement('input')
				titleInput.classList.add('titleInput')
				titleInput.value = list.title
				titleInput.onkeypress = (e) => {
					if (e.keyCode == 13)
						titleInput.blur()
				}
				titleInput.onblur = () => {
					list.title = titleInput.value
					localStorage.setItem('myHomePage.lists', JSON.stringify(lists))
				}
				legend.appendChild(titleInput)
				fieldset.appendChild(legend)
				let ul = document.createElement('ul')
				ul.classList.add('itemsList')
				let li = document.createElement('li')
				li.classList.add('addItem')
				li.classList.add('item')
				li.innerText = '+'
				li.onclick = () => {showItemEdition(list.id)}
				ul.appendChild(li)

				list.items.map((item) => {
					let itemLi = document.createElement('li')
					itemLi.classList.add('item')
					itemLi.onclick = () => {
						location.href = item.url
					}
					itemLi.oncontextmenu = (e) => {
						let contextMenu = document.getElementById('contextMenu')
						contextMenu.innerHTML = ''
						let contextMenuItem = document.createElement('li')
						contextMenuItem.classList.add('contextMenuItem')
						contextMenuItem.innerText = "Editar Item"
						contextMenuItem.onclick = () => {showItemEdition(list.id, item)}
						contextMenu.appendChild(contextMenuItem)
						contextMenuItem = document.createElement('li')
						contextMenuItem.classList.add('contextMenuItem')
						contextMenuItem.innerText = "Excluir Item"
						contextMenuItem.onclick = () => {deleteItem(item.id)}
						contextMenu.appendChild(contextMenuItem)
						contextMenu.style.left = e.clientX + 'px'
						contextMenu.style.top = (e.clientY + window.scrollY) + 'px'
						contextMenu.style.display = 'block'
						contextMenu.focus()
					}
					let itemImg = document.createElement('img')
					itemImg.src = item.imgSrc
					itemLi.appendChild(itemImg)
					let itemName = document.createElement('span')
					itemName.innerText = item.name
					itemLi.appendChild(itemName)
					ul.appendChild(itemLi)
				})

				fieldset.appendChild(ul)
				listLi.appendChild(fieldset)
				listsContainer.appendChild(listLi)
			})
			// document.getElementById('deleteAll').style.display = 'block'
		}
		// else
		// document.getElementById('deleteAll').style.display = 'none'
	}
	// console.log('lists: ', lists)
}

function addList() {
	let id = Math.floor(1 + Math.random() * 9999999)
	while (document.getElementById(id))
		id = Math.floor(1 + Math.random() * 9999999)
	lists.unshift({
		id: id,
		title: 'Nova Lista ' + (lists.filter(list => list.title.startsWith('Nova Lista')).length + 1),
		items: []
	})
	localStorage.setItem('myHomePage.lists', JSON.stringify(lists))
	getLists()
}

function deleteList(listId) {
	lists.splice(lists.findIndex(list => list.id == listId), 1)
	localStorage.setItem('myHomePage.lists', JSON.stringify(lists))
	hideContextMenu()
	getLists()
}

function deleteItem(itemId) {
	let list = lists.find(list => list.items.find(item => item.id == itemId))
	list.items.splice(list.items.findIndex(item => item.id == itemId), 1)
	localStorage.setItem('myHomePage.lists', JSON.stringify(lists))
	hideContextMenu()
	getLists()
}

var editingItem
function showItemEdition(listId, item) {
	if (!item) {
		let id = Math.floor(1 + Math.random() * 9999999)
		while (document.getElementById(id))
			id = Math.floor(1 + Math.random() * 9999999)
		editingItem = {
			id: id,
			listId: listId,
			name: '',
			url: ''
		}
	}
	else {
		editingItem = item
		document.getElementById('itemName').value = editingItem.name
		document.getElementById('itemUrl').value = editingItem.url
	}
	document.getElementById('shadow').style.display = 'block'
	document.getElementById('editItemContainer').style.display = 'flex'
	document.getElementById('itemName').focus()
}

function hideItemEdition() {
	document.getElementById('shadow').style.display = 'none'
	document.getElementById('editItemContainer').style.display = 'none'
	editingItem = null
	document.getElementById('itemName').value = ''
	document.getElementById('itemUrl').value = ''
}

function updateEditingItem() {
	editingItem.name = document.getElementById('itemName').value
	editingItem.url = document.getElementById('itemUrl').value
}

function saveEditingItem() {
	if (editingItem.name.trim() == '')
		document.getElementById('itemName').focus()
	else if (editingItem.url.trim() == '')
		document.getElementById('itemUrl').focus()
	else {
		if (!editingItem.url.startsWith('http'))
			editingItem.url = 'http://' + editingItem.url
		editingItem.imgSrc = `https://s2.googleusercontent.com/s2/favicons?sz=64&domain_url=${ editingItem.url }`
		let list = lists.find(list => list.id == editingItem.listId)
		// console.log(list)
		if (list.items.find(item => item.id == editingItem.id))
			list.items.splice(list.items.indexOf(list.items.find(item => item.id == editingItem.id)), 1, editingItem)
		else
			list.items.push(editingItem)
		localStorage.setItem('myHomePage.lists', JSON.stringify(lists))
		hideItemEdition()
		getLists()
	}
}

function hideContextMenu() {
	let contextMenu = document.getElementById('contextMenu')
	contextMenu.style.display = 'none'
}

getLists()
document.getElementById('searchInput').focus()

//FUNÇÃO USADA APENAS DURANTE O DESENVOLVIMENTO
// function deleteAll() {
// 	if (lists.length > 0)
// 		if (confirm("Clique em 'ok' se realmente quiser excluir tudo.")) {
// 			listsContainer.innerHTML = ''
// 			lists = []
// 			document.getElementById('deleteAll').style.display = 'none'
// 			localStorage.setItem('myHomePage.lists', '[]')
// 		}
// }