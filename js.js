var lists = []
var listsContainer = document.getElementById('listsContainer')
var backgroundImages = []
var searchList = ['Nature', 'Cars', 'City', 'Minimalist', 'Rain', 'Earth', 'Lines', 'Mosaic', 'Sunset', 'Ocean', 'Islands', 'Pets', 'Rainbow']
var search = searchList[Math.floor(Math.random()*searchList.length)]

if (!localStorage.getItem('myHomePage.backgroundImages')) {
	console.log('Adicionou o script do google')
	let script = document.createElement('script')
	script.src = `https://www.googleapis.com/customsearch/v1?searchType=image&q=${window.innerWidth > window.innerHeight ? 'wide' : ''}+wallpaper+${ search }&imgSize=LARGE&rights=cc_publicdomain&imgType=photo&imgDominantColor=black&imgColorType=trans&callback=getBackgroundImages&key=AIzaSyDYrgmw2FfsFIbowl_8bJYTl4umuQCtv84&cx=5fc4b6eacb628da8f`
	document.getElementsByTagName('head')[0].appendChild(script)
}
else {
	console.log('Pegando links do armazenamento local')
	let photos = JSON.parse(localStorage.getItem('myHomePage.backgroundImages'))
	photos.map((photoLink) => {
		backgroundImages.push(photoLink)
	})
	setBackgroundImage()
}

function getBackgroundImages(res) {
	console.log('Retorno do google: ', res)
	if (res.items) {
		res.items.map((photo) => {
			backgroundImages.push(photo.link)
		})
		setBackgroundImage()
	}
}

function setBackgroundImage() {
	console.log('Setando imagem de fundo.')
	let section = document.getElementById('section')
	let random = Math.floor(Math.random() * backgroundImages.length)
	section.style.background = `url(${ backgroundImages[random] })`
	section.style.backgroundRepeat = 'no-repeat'
	section.style.backgroundSize = "cover"
	section.style.backgroundPosition = 'center'
	section.style.backgroundAttachment = 'fixed'
	console.log('backgroundImages antes de remover o link:', backgroundImages)
	backgroundImages.splice(random, 1)
	console.log('backgroundImages depois de remover o link:', backgroundImages)
	if (backgroundImages.length > 0)
		localStorage.setItem('myHomePage.backgroundImages', JSON.stringify(backgroundImages))
	else
		localStorage.removeItem('myHomePage.backgroundImages')
	console.log('localStorage atualizado. Quantidade de imagens restantes: ', backgroundImages.length)
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
		window.open(url = `http://google.com/search?q=${ search }`, target = `_blank`)
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
						contextMenu.style.left = e.clientX + 'px'
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
						window.open(url = `${ item.url }`, target = '_blank')
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
	console.log('lists: ', lists)
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
		console.log(list)
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