document.addEventListener('DOMContentLoaded', function() {
    // Get all list items
    const listItems = document.querySelectorAll('li');
    const priorityDiv = document.querySelector('.priority');
    
    // Create a map to store items by category
    const categoryMap = new Map();
    
    // Find items with 🔥 and group them by category
    listItems.forEach(item => {
        if (item.textContent.includes('🔥')) {
            // Get the category name from the h3 before the parent ul
            const parentUl = item.parentElement;
            const categoryH3 = parentUl.previousElementSibling;
            const categoryName = categoryH3 && categoryH3.tagName === 'H3' 
                ? categoryH3.textContent.replace('🔥', '').trim() 
                : '';
            
            // Add to category map
            if (!categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, []);
            }
            categoryMap.get(categoryName).push(item.textContent.replace('🔥', '').trim());
        }
    });
    
    // Create the priority section structure
    categoryMap.forEach((items, category) => {
        // Create category heading
        const categoryHeading = document.createElement('h2');
        categoryHeading.textContent = category;
        priorityDiv.appendChild(categoryHeading);
        
        // Create list for this category
        const categoryList = document.createElement('ul');
        items.forEach(itemText => {
            const listItem = document.createElement('li');
            listItem.textContent = itemText;
            categoryList.appendChild(listItem);
        });
        priorityDiv.appendChild(categoryList);
    });
}); 