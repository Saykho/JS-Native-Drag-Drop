//получаем из DOM-дерева узлы, которые необходимы для дальнейшей работы
const productsNode = document.getElementById("products");
const categoriesNode = document.getElementById("filter-categories");
const takeNElementNode = document.getElementById("take-n-elements");

//создаем переменные с пустыми массивами
let savedAllProducts = [];
let savedAllCategories = [];

//асинхронная функция, которая из сервера получает список продуктов
async function getProducts() {
    const url = "https://dummyjson.com/products";
    const getProductsData = await fetch(url).then(resp => resp.json());
    const products = getProductsData.products;
    savedAllProducts = products;
    savedAllCategories = getCategoriesFromProducts(products);

    //перебираем каждую категорию и добавляем в узел categoriesNode
    savedAllCategories.forEach(category => {
        const optionNode = createOptionNode(category);
        categoriesNode.appendChild(optionNode);
    });
    categoriesNode.removeAttribute("disabled"); //после загрузки всех категорий из сервера, удаляем атрибут disabled, чтоб был доступен выбор категорий

    //первые N количество продуктов перебираем и добавляем в productsNode
    savedAllProducts.slice(0, getTakeNElementsValue()).forEach(product => {
        addProductToProductsNode(product);
    });
}

//функция создания узла option с классом и содержимым
function createOptionNode(category) {
    const optionNode = document.createElement("option");
    optionNode.setAttribute("value", category);
    optionNode.innerText = category;
    return optionNode;
}

//функция для работы с Drag&Drop
function addDragAndDropToProductsNode() {
    productsNode.addEventListener("dragstart", event => {
        event.target.classList.add("selected");
    });
    productsNode.addEventListener("dragend", event => {
        event.target.classList.remove("selected");
    });

    const getNextElement = (cursorPosition, currentElement) => {
        const currentElementCord = currentElement.getBoundingClientRect();
        const currentElementCenter = currentElementCord.y + currentElementCord.height / 2;
        const nextElement = (cursorPosition < currentElementCenter) ? currentElement : currentElement.nextElementSibling;
        return nextElement;
    };

    productsNode.addEventListener("dragover", event => {
        event.preventDefault();

        const activeElement = productsNode.querySelector(".selected");
        const currentElement = event.target;
        const isMovable = activeElement !== currentElement && currentElement.classList.contains("products__product");
        if (!isMovable) {
            return;
        }
        const nextElement = getNextElement(event.clientY, currentElement);
        if (nextElement &&
            activeElement === nextElement.previousElementSibling ||
            activeElement === nextElement) {
            return;
        }
        productsNode.insertBefore(activeElement, nextElement);
    });
}

//функция добавления productNode в productsNode и descriptionNode в productNode
function addProductToProductsNode(product) {
    const productNode = createLiNode(product);
    productsNode.appendChild(productNode);

    const descriptionNode = createProductDescriptionDivNode(product);
    productNode.appendChild(descriptionNode);
}

//функция создания тега li с классом products__product и содержимым
function createLiNode(product) {
    const productNode = document.createElement("li");
    productNode.classList.add("products__product");
    productNode.innerText = product.title;
    productNode.draggable = true;
    return productNode;
}

//функция создания тега div с классом product-description, которы содержит описание продуктов
function createProductDescriptionDivNode(product) {
    const descriptionNode = document.createElement("div");
    descriptionNode.classList.add("product-description");
    descriptionNode.innerText = `${product.title}: ${product.description}. Price: ${product.price}$`;
    return descriptionNode;
}

//функция получения категорий из продуктов
function getCategoriesFromProducts(products) {
    const productsSet = new Set(products.map(c => c.category)); //продукты преобразовываем с помощью map в список категорий, и с помощью Set получаем только уникальные значения
    return Array.from(productsSet); // с помощью Array.from преобразовываем в массив категорий
}

//функция получения продуктов в соответствии введенным числом
function getTakeNElementsValue() {
    let value = takeNElementNode.value; //записываем значение takeNElementNode в переменную value
    value = isNaN(value) ? 0 : +value; //если value не число, то получаем 0, иначе получаем число
    //если value меньше 0, получаем 0, иначе возвращаем value
    if(value < 0) {
        value = 0;
    }
    return value;
}

addDragAndDropToProductsNode();
getProducts().then();


//callback
function onCategoriesChange(category) {
    if (!category) {
        return;
    }

    //фильтрация по категориям
    //если категория = all, то возвращаем весь список продуктов, иначе фильтруем с помощью filter
    const products = category === "all"
        ? savedAllProducts
        : savedAllProducts.filter(p => p.category === category);

    productsNode.innerHTML = ""; // перед выводом на экран отфильтрованных продуктов, очищаем productsNode

    //перебираем каждые первые N продукты и добавляем в ProductsNode
    products.slice(0, getTakeNElementsValue()).forEach(product => {
        addProductToProductsNode(product);
    });
}

//callback
function onTakeNElementsValueChange() {
    const category = categoriesNode.value;
    onCategoriesChange(category);
}


