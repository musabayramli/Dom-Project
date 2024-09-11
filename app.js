let wishlist = [];
let cart = [];

// Ümumi bir funksiya ilə element yaradırıq
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Atributları əlavə et
    for (let attr in attributes) {
        if (attr === 'classList') {
            attributes[attr].forEach(cls => element.classList.add(cls));
        } else if (attr.startsWith('on')) {
            element.addEventListener(attr.slice(2).toLowerCase(), attributes[attr]);
        } else {
            element.setAttribute(attr, attributes[attr]);
        }
    }

    // Children əlavə et
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });

    return element;
}

// Məhsul kartını yaradan funksiya
function createCard(product) {
    let productQuantity = 1;  

    // Input elementini təyin edirik
    const productQuantityInput = createElement('input', {
        classList: ['form-control', 'w-25'],
        type: 'text',
        value: productQuantity,
        id: `product-${product.id}`
    });

    const cardHeader = createElement('div', {
        classList: ['card-header', 'd-flex', 'justify-content-between', 'align-items-center']
    }, [
        createElement('h5', { classList: ['card-title'] }, [product.name]),
        createElement('i', {
            classList: ['fa-regular', 'fa-heart'],
            onclick: (event) => toggleWishlist(product, event)
        })
    ]);

    const cardBody = createElement('div', { classList: ['card-body'] }, [
        createElement('p', {}, [product.desc]),
        createElement('span', {}, [`${product.price} AZN`])
    ]);

    const cardFooter = createElement('div', { classList: ['card-footer', 'd-flex', 'gap-3', 'align-items-center'] }, [
        createElement('button', { classList: ['btn', 'btn-sm', 'btn-outline-secondary'], onclick: () => adjustQuantity('minus', productQuantityInput) }, ['-']),
        productQuantityInput,
        createElement('button', { classList: ['btn', 'btn-sm', 'btn-outline-secondary'], onclick: () => adjustQuantity('plus', productQuantityInput) }, ['+']),
        createElement('button', { classList: ['btn', 'btn-primary'], onclick: () => addToCart(product) }, ['Add to cart'])
    ]);

    const card = createElement('div', { classList: ['card'] }, [cardHeader, cardBody, cardFooter]);

    const col = createElement('div', { classList: ['col-12', 'col-md-6', 'col-lg-4', 'mb-3'] }, [card]);

    return col;
}

// Kategoriya elementini yaradan funksiya
function createCategoryListItem(category, isActive = false) {
    const li = createElement('li', { classList: ['list-group-item'] }, [category]);
    if (isActive) li.classList.add('active');
    li.addEventListener('click', () => {
        document.querySelectorAll('#categoryList li').forEach(li => li.classList.remove('active'));
        li.classList.add('active');
        displayProducts(category);
    });
    return li;
}

// Kategoriyaları göstərin
function displayCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.appendChild(createCategoryListItem('All Data', true));
    const categories = [...new Set(PRODUCTS.map(product => product.category))];
    categories.forEach(category => categoryList.appendChild(createCategoryListItem(category)));
}

// Miqdarı artırıb azaltmaq funksiyası
function adjustQuantity(action, inputElement) {
    let currentQuantity = parseInt(inputElement.value);
    
    if (action === 'minus' && currentQuantity > 1) {
        inputElement.value = currentQuantity - 1;
    }
    
    if (action === 'plus') {
        inputElement.value = currentQuantity + 1;
    }
}

// Wishlist-ə əlavə etmək üçün funksiya
function toggleWishlist(product, event) {
    const index = wishlist.findIndex(item => item.id === product.id);
    const heartIcon = event.target;

    if (index >= 0) {
        wishlist.splice(index, 1); 
        heartIcon.classList.remove('fa-solid');
        heartIcon.style.color = 'inherit';
    } else {
        wishlist.push(product); 
        heartIcon.classList.add('fa-solid');
        heartIcon.style.color = 'red';
    }
    updateWishlistMenu();
}

// Wishlist menyusunu yeniləmək üçün funksiya
function updateWishlistMenu() {
    const wishlistMenu = document.getElementById('wishlistMenu');
    wishlistMenu.innerHTML = '';

    if (wishlist.length === 0) {
        wishlistMenu.appendChild(createElement('li', { classList: ['dropdown-item'] }, ['No items in wishlist']));
    } else {
        wishlist.forEach(item => {
            wishlistMenu.appendChild(createElement('li', { classList: ['dropdown-item'] }, [item.name]));
        });
    }
}

// Səbətə məhsul əlavə etmək üçün funksiya
function addToCart(product) {
    const quantityInput = document.getElementById(`product-${product.id}`);
    const quantity = parseInt(quantityInput.value);
    
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += quantity;  
    } else {
        cart.push({ ...product, quantity });  
    }
    updateCartModal();
}

// Səbəti göstərən funksiya və ümumi məbləği göstər
function updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';

    let totalAmount = 0; 

    if (cart.length === 0) {
        cartItems.textContent = 'No items in cart';
    } else {
        cart.forEach(item => {
            const cartItem = createElement('div', { classList: ['cart-item', 'd-flex', 'justify-content-between'] }, [
                createElement('span', { classList: ['item-name'] }, [item.name]),
                createElement('span', { classList: ['item-price'] }, [`${item.price} AZN x ${item.quantity}`]),
                createQuantityControlForCart(item)
            ]);
            cartItems.appendChild(cartItem);
            totalAmount += item.price * item.quantity;  
        });

        // Ümumi məbləği göstərən element əlavə edirik
        cartItems.appendChild(createElement('div', { classList: ['d-flex', 'justify-content-between', 'mt-3'] }, [
            createElement('strong', {}, ['Total Amount:']),
            createElement('strong', {}, [`${totalAmount.toFixed(2)} AZN`])
        ]));
    }
}

// Səbətdəki məhsulun miqdarını artırıb-azaltmaq üçün funksiya
function createQuantityControlForCart(item) {
    const inputQuantity = createElement('input', { classList: ['form-control', 'w-25'], type: 'text', value: item.quantity });

    const btnMinus = createElement('button', { classList: ['btn', 'btn-sm', 'btn-outline-secondary'], onclick: () => adjustCartItemQuantity(item, inputQuantity, -1) }, ['-']);
    const btnPlus = createElement('button', { classList: ['btn', 'btn-sm', 'btn-outline-secondary'], onclick: () => adjustCartItemQuantity(item, inputQuantity, 1) }, ['+']);

    return createElement('div', { classList: ['d-flex', 'align-items-center', 'gap-2'] }, [btnMinus, inputQuantity, btnPlus]);
}

// Səbətdəki məhsulun miqdarını tənzimləmək üçün funksiya
function adjustCartItemQuantity(item, input, amount) {
    const currentQuantity = parseInt(input.value);
    item.quantity = Math.max(1, currentQuantity + amount);  
    updateCartModal();
}

// "Show Cart" düyməsi kliklənəndə səbət modalını göstər
document.getElementById('btnShowCart').addEventListener('click', () => {
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    updateCartModal();
    cartModal.show();
});

// Ümumi məhsul siyahısını göstərmək
function displayProducts(category) {
    const dvProducts = document.getElementById('dvProducts');
    dvProducts.innerHTML = '';
    const filteredProducts = category === 'All Data' ? PRODUCTS : PRODUCTS.filter(product => product.category === category);
    filteredProducts.forEach(product => dvProducts.appendChild(createCard(product)));
}

// Kategoriyaları göstərin
function displayCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.appendChild(createCategoryListItem('All Data', true));
    const categories = [...new Set(PRODUCTS.map(product => product.category))];
    categories.forEach(category => categoryList.appendChild(createCategoryListItem(category)));
}

// Axtarış funksiyası
document.getElementById('txtSearch').addEventListener('input', function (e) {
    const searchText = e.target.value.toLowerCase();
    const filteredProducts = PRODUCTS.filter(product => product.name.toLowerCase().includes(searchText));
    const dvProducts = document.getElementById('dvProducts');
    dvProducts.innerHTML = '';
    filteredProducts.forEach(product => dvProducts.appendChild(createCard(product)));
});

// Məhsul məlumatları
const PRODUCTS = [
    {id: 1, name: "Laptop", price: 999.99, desc: 'High performance laptop', category: "Electronics"},
    {id: 2, name: "Smartphone", price: 699.99, desc: 'Latest model smartphone', category: "Electronics"},
    {id: 3, name: "Headphones", price: 99.99, desc: 'Wireless headphones', category: "Electronics"},
    {id: 4, name: "T-shirt", price: 19.99, desc: 'Comfortable cotton t-shirt', category: "Clothing"},
    {id: 5, name: "Jeans", price: 49.99, desc: 'Stylish denim jeans', category: "Clothing"},
    {id: 6, name: "Backpack", price: 79.99, desc: 'Durable backpack', category: "Accessories"},
    {id: 7, name: "Watch", price: 149.99, desc: 'Fashionable wristwatch', category: "Accessories"},
    {id: 8, name: "Desk Lamp", price: 29.99, desc: 'LED desk lamp', category: "Home & Office"},
    {id: 9, name: "Coffee Mug", price: 9.99, desc: 'Ceramic coffee mug', category: "Home & Office"},
    {id: 10, name: "Notebook", price: 4.99, desc: 'Spiral notebook', category: "Home & Office"}
];

// İlk olaraq kategoriyalar və məhsullar yüklənir
displayCategories();
displayProducts('All Data');
