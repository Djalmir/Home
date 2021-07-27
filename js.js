var user = JSON.parse(localStorage.getItem('Razion.user')) || null
var Axios = axios.create({
	baseURL: 'https://razion-apis.herokuapp.com/',
	// baseURL: 'http://192.168.100.100:3333/',
	withCredentials: false,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json'
	}
})

Axios.interceptors.request.use((config) => {
	setLoading(true)
	return config
}, (error) => {
	setLoading(false)
	showMessage('Erro', error.response.data.error)
	return Promise.reject(error)
})

Axios.interceptors.response.use((res) => {
	setLoading(false)
	return res
}, (error) => {
	setLoading(false)
	showMessage('Erro', error.response.data.error)
	return Promise.reject(error)
})

var lists = []
var container = document.getElementById('container')
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
	lists = []
	listsContainer.innerHTML = ''
	if (user) {
		Axios.get('homePage/list/listAll')
			.then((res) => {
				lists = res.data
				console.log(lists)
				createListsVisual()
			})
	}
	else if (localStorage.getItem('myHomePage.lists')) {
		lists = JSON.parse(localStorage.getItem('myHomePage.lists')) || []
		if (lists.length > 0) {
			createListsVisual()
			// document.getElementById('deleteAll').style.display = 'block'
		}
		// else
		// document.getElementById('deleteAll').style.display = 'none'
	}
	// console.log('lists: ', lists)
}

function addList() {
	if (user) {
		Axios.post('homePage/list/create', {
			title: 'Nova Lista ' + (lists.filter(list => list.title.startsWith('Nova Lista')).length + 1)
		})
			.then(() => {
				getLists()
			})
	}
	else {
		let _id = Math.floor(1 + Math.random() * 9999999)
		while (document.getElementById(_id))
			_id = Math.floor(1 + Math.random() * 9999999)
		lists.unshift({
			_id: _id,
			title: 'Nova Lista ' + (lists.filter(list => list.title.startsWith('Nova Lista')).length + 1),
			items: []
		})
		localStorage.setItem('myHomePage.lists', JSON.stringify(lists))
		getLists()
	}
}

function deleteList(l) {
	hideContextMenu()
	if (user) {
		Axios.delete(`homePage/list/delete/${ l._id }`)
			.then(() => {
				getLists()
			})
	}
	else {
		lists.splice(lists.findIndex(list => list._id == l._id), 1)
		localStorage.setItem('myHomePage.lists', JSON.stringify(lists))
		getLists()
	}
}

function createListsVisual() {
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
				contextMenuItem.onclick = () => {deleteList(list)}
				contextMenu.appendChild(contextMenuItem)
				contextMenu.style.left = (e.clientX + 200 > window.innerWidth ? window.innerWidth - 200 : e.clientX) + 'px'
				contextMenu.style.top = (e.clientY + container.scrollTop) + 'px'
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
			if (e.key == 'Enter')
				titleInput.blur()
		}
		titleInput.onblur = () => {
			list.title = titleInput.value
			if (user) {
				Axios.put(`homePage/list/update/${ list._id }`, {
					title: list.title
				})
			}
			else
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
		li.onclick = () => {showItemEdition(list._id)}
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
				contextMenuItem.onclick = () => {showItemEdition(list._id, item)}
				contextMenu.appendChild(contextMenuItem)
				contextMenuItem = document.createElement('li')
				contextMenuItem.classList.add('contextMenuItem')
				contextMenuItem.innerText = "Excluir Item"
				contextMenuItem.onclick = () => {deleteItem(item._id)}
				contextMenu.appendChild(contextMenuItem)
				contextMenu.style.left = (e.clientX + 200 > window.innerWidth ? window.innerWidth - 200 : e.clientX) + 'px'
				contextMenu.style.top = (e.clientY + container.scrollTop) + 'px'
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
}

function deleteItem(itemId) {
	if (user) {
		hideContextMenu()
		Axios.delete(`homePage/shortcut/delete/${ itemId }`)
			.then(() => {
				getLists()
			})
	}
	else {
		let list = lists.find(list => list.items.find(item => item._id == itemId))
		list.items.splice(list.items.findIndex(item => item._id == itemId), 1)
		localStorage.setItem('myHomePage.lists', JSON.stringify(lists))
		hideContextMenu()
		getLists()
	}
}

var editingItem
function showItemEdition(listId, item) {
	if (!item) {
		if (user) {
			editingItem = {
				list: listId,
				name: '',
				url: ''
			}
		}
		else {
			let _id = Math.floor(1 + Math.random() * 9999999)
			while (document.getElementById(_id))
				_id = Math.floor(1 + Math.random() * 9999999)
			editingItem = {
				_id: _id,
				list: listId,
				name: '',
				url: ''
			}
		}
	}
	else {
		editingItem = item
		document.getElementById('itemName').value = editingItem.name
		document.getElementById('itemUrl').value = editingItem.url
	}
	document.getElementById('itemShadow').style.display = 'block'
	document.getElementById('editItemContainer').style.display = 'flex'
	document.getElementById('itemName').focus()
}

function hideItemEdition() {
	document.getElementById('itemShadow').style.display = 'none'
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
		let list = lists.find(list => list._id == editingItem.list)
		// console.log(list)
		if (user) {
			if (list.items.find(item => item._id == editingItem._id)) {
				Axios.put(`homePage/shortcut/update/${ editingItem._id }`, {
					name: editingItem.name,
					url: editingItem.url,
					imgSrc: editingItem.imgSrc,
					list: editingItem.list
				})
					.then(() => {
						hideItemEdition()
						getLists()
					})
			}
			else {
				Axios.post('homePage/shortcut/create', {
					name: editingItem.name,
					url: editingItem.url,
					imgSrc: editingItem.imgSrc,
					list: editingItem.list
				})
					.then(() => {
						hideItemEdition()
						getLists()
					})
			}
		}
		else {
			if (list.items.find(item => item._id == editingItem._id))
				list.items.splice(list.items.indexOf(list.items.find(item => item._id == editingItem._id)), 1, editingItem)
			else
				list.items.push(editingItem)
			localStorage.setItem('myHomePage.lists', JSON.stringify(lists))
			hideItemEdition()
			getLists()
		}
	}
}

function hideContextMenu() {
	let contextMenu = document.getElementById('contextMenu')
	contextMenu.style.display = 'none'
}

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

function showHideAside() {
	let aside = document.querySelector('#aside')
	if (aside.style.right != '0px') {
		document.querySelector('#asideShadow').style.display = 'block'
		aside.style.right = '0px'
	}
	else {
		document.querySelector('#asideShadow').style.display = 'none'
		aside.style.right = '-410px'
	}
}

function login() {
	let email = document.querySelector('#emailInput').value
	let password = document.querySelector('#passwordInput').value

	if (email.trim() == '')
		showMessage('Por favor', 'Informe o email')
	else if (password.trim() == '')
		showMessage('Por favor', 'Informe a senha')
	else {
		Axios.post('session/login', {
			email,
			password
		})
			.then((res) => {
				// console.log(res.data)
				user = res.data.user
				localStorage.setItem('Razion.user', JSON.stringify(user))
				Axios.defaults.headers.user_id = user._id
				showUserNameBt()
				showHideAside()
				getLists()
			})
	}
}

function logout() {
	showHideAside()
	user = null
	localStorage.removeItem('Razion.user')
	Axios.defaults.headers.user_id = null
	setTimeout(() => {
		hideUserNameBt()
	}, 400)
	getLists()
}

const notLoggedContainer = document.querySelector('#notLoggedContainer')
function showUserNameBt() {
	document.querySelector('#loginBt').style.display = 'none'
	let bt = document.querySelector('#userNameBt')
	bt.style.display = 'block'
	bt.innerText = user.name
	// document.querySelector('#notLoggedContainer').style.display = 'none'
	document.querySelector('#aside').removeChild(notLoggedContainer)//TIVE QUE REMOVER A CRIANÇA POIS O NAVEGADOR COM SEU "MARAVILHOSO" AUTOCOMPLETE IRREMOVÍVEL, ENFIAVA UM EMAIL NO CAMPO DE PESQUISA DO GOOGLE! 💩
	document.querySelector('#loggedContainer').style.display = 'block'
	document.querySelector('#userNameH1').innerText = user.name
}

function hideUserNameBt() {
	document.querySelector('#loginBt').style.display = 'block'
	document.querySelector('#userNameBt').style.display = 'none'
	// document.querySelector('#notLoggedContainer').style.display = 'block'
	document.querySelector('#aside').appendChild(notLoggedContainer)
	document.querySelector('#loggedContainer').style.display = 'none'
}

function showSignupForm() {
	document.querySelector('#loginContainer').style.animation = 'turnOut linear .2s 1'
	document.addEventListener('animationend', showSignup)
	function showSignup() {
		document.removeEventListener('animationend', showSignup)
		document.querySelector('#loginContainer').style.display = 'none'
		let signupContainer = document.querySelector('#signupContainer')
		signupContainer.style.display = 'block'
		signupContainer.style.animation = 'turnIn linear .2s 1'
	}
}

function signup() {
	let name = document.querySelector('#signupNameInput').value
	let email = document.querySelector('#signupEmailInput').value
	let password = document.querySelector('#signupPasswordInput').value
	let confirmPassword = document.querySelector('#signupConfirmPasswordInput').value

	if (name.trim() == '')
		showMessage('Por favor', 'Informe seu nome')
	else if (email.trim() == '')
		showMessage('Por favor', 'Informe seu e-mail')
	else if (password.trim() == '')
		showMessage('Por favor', 'Digite uma senha')
	else if (confirmPassword.trim() == '')
		showMessage('Por favor', 'Confirme a senha')
	else if (password != confirmPassword)
		showMessage('Ops...', 'As senhas não coincidem')
	else {
		Axios.post('session/signup', {
			name,
			email,
			password
		})
			.then((res) => {
				showMessage('Oba!', 'Cadastro efetuado com sucesso!\nBoas vindas!')
				console.log('res.data: ', res.data)
				user = res.data
				localStorage.setItem('Razion.user', JSON.stringify(user))
				Axios.defaults.headers.user_id = user._id
				showUserNameBt()
				showHideAside()
				getLists()
			})
	}
}

function showLoginForm() {
	document.querySelector('#signupContainer').style.animation = 'turnOut linear .2s 1'
	document.addEventListener('animationend', showLogin)
	function showLogin() {
		document.removeEventListener('animationend', showLogin)
		document.querySelector('#signupContainer').style.display = 'none'
		let loginContainer = document.querySelector('#loginContainer')
		loginContainer.style.display = 'block'
		loginContainer.style.animation = 'turnIn linear .2s 1'
	}
}

function setLoading(loading) {
	let loadingContainer = document.querySelector('#loadingContainer')
	if (loading)
		loadingContainer.style.display = 'flex'
	else
		loadingContainer.style.display = 'none'
}

document.querySelector('#loginForm').addEventListener('keypress', keypress)
document.querySelector('#signupForm').addEventListener('keypress', keypress)
function keypress(e) {
	if (e.keyCode == 13) {
		if (document.querySelector('#loginContainer').style.display == 'block')
			login()
		else if (document.querySelector('#signupContainer').style.display == 'block')
			signup()
	}
}

function showMessage(title, body) {
	document.querySelector('#messageHeader').innerText = title
	document.querySelector('#messageBody').innerText = body
	let message = document.querySelector('#messageContainer')
	message.style.display = 'flex'
	message.style.animation = 'fadeIn linear .2s 1'
	document.querySelector('#messageOkBt').focus()
}

function hideMessage() {
	let message = document.querySelector('#messageContainer')
	message.style.animation = 'fadeOut linear .2s 1'
	document.addEventListener('animationend', hideMsg)
	function hideMsg() {
		document.removeEventListener('animationend', hideMsg)
		message.style.display = 'none'
	}
}

if (user) {
	Axios.defaults.headers.user_id = user._id
	showUserNameBt()
}
getLists()
document.getElementById('searchInput').focus()