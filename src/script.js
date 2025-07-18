document.addEventListener('DOMContentLoaded', function() {
    // Create section wrappers for multi-column layout
    createSectionWrappers();
    
    // Create accordions from h3 + ul pairs
    createAccordions();
    
    // Convert all list items to checkboxes
    convertListItemsToCheckboxes();
    
    // Handle priority items (must run after checkbox conversion)
    handlePriorityItems();
    
    // Make task text clickable
    makeTaskTextClickable();
});

function createSectionWrappers() {
    const container = document.querySelector('.container');
    const contentDiv = container.querySelector('.content');
    const contentInner = contentDiv.querySelector('.content__inner');
    const h2Elements = contentInner.querySelectorAll('h2');
    
    // Find the horizontal rule (hr element) within the content inner div
    const hrElement = contentInner.querySelector('hr');
    
    // Create two grid containers
    const topGrid = document.createElement('div');
    topGrid.className = 'section-grid top-grid';
    
    const bottomGrid = document.createElement('div');
    bottomGrid.className = 'section-grid bottom-grid';
    
    // First, collect all h2s and determine their position relative to hr
    const sections = [];
    h2Elements.forEach((h2, index) => {
        // Skip the priority section (it should stay at the top)
        if (h2.textContent.includes('Priority')) {
            return;
        }
        
        // Check if this h2 comes after the hr by walking up the DOM tree
        let isAfterHr = false;
        if (hrElement) {
            let currentElement = h2;
            while (currentElement && currentElement !== contentInner) {
                if (currentElement === hrElement) {
                    isAfterHr = true;
                    break;
                }
                currentElement = currentElement.parentElement;
            }
            
            // If we didn't find hr as a parent, check if h2 comes after hr in the same container
            if (!isAfterHr) {
                let sibling = hrElement.nextElementSibling;
                while (sibling) {
                    if (sibling === h2) {
                        isAfterHr = true;
                        break;
                    }
                    sibling = sibling.nextSibling;
                }
            }
        }
        
        sections.push({
            h2: h2,
            isAfterHr: isAfterHr,
            index: index
        });
    });
    
    // Now process sections in their original order
    sections.forEach(section => {
        const sectionWrapper = document.createElement('div');
        sectionWrapper.className = 'section-wrapper';
        
        // Move the h2 into the wrapper
        sectionWrapper.appendChild(section.h2.cloneNode(true));
        
        // Find all subsequent elements until the next h2 or hr or end of container
        let nextElement = section.h2.nextElementSibling;
        while (nextElement && nextElement.tagName !== 'H2' && nextElement.tagName !== 'HR') {
            const elementToMove = nextElement;
            nextElement = nextElement.nextElementSibling;
            sectionWrapper.appendChild(elementToMove);
        }
        
        // Add to the appropriate grid based on pre-determined position
        if (section.isAfterHr) {
            // h2 is after the hr, add to bottom grid
            bottomGrid.appendChild(sectionWrapper);
        } else {
            // h2 is before the hr, add to top grid
            topGrid.appendChild(sectionWrapper);
        }
        
        // Remove the original h2
        section.h2.remove();
    });
    
    // Insert the grids in the correct order within the content inner div
    if (topGrid.children.length > 0) {
        // Insert top grid at the beginning of the content inner div
        contentInner.insertBefore(topGrid, contentInner.firstChild);
    }
    
    if (bottomGrid.children.length > 0) {
        // Insert bottom grid after the hr
        if (hrElement) {
            contentInner.insertBefore(bottomGrid, hrElement.nextSibling);
        } else {
            contentInner.appendChild(bottomGrid);
        }
    }
}

function createAccordions() {
    // Find all h3 elements within section wrappers
    const h3Elements = document.querySelectorAll('.section-wrapper h3');
    
    h3Elements.forEach((h3, index) => {
        // Find the next sibling ul element
        const nextUl = h3.nextElementSibling;
        
        if (nextUl && nextUl.tagName === 'UL') {
            // Create accordion container
            const accordionContainer = document.createElement('div');
            accordionContainer.className = 'accordion';
            
            // Create button from h3
            const button = document.createElement('button');
            button.className = 'accordion-trigger';
            button.id = `accordion-trigger-${index}`;
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-controls', `accordion-panel-${index}`);
            button.innerHTML = h3.innerHTML;
            
            // Create panel container
            const panel = document.createElement('div');
            panel.className = 'accordion-panel';
            panel.id = `accordion-panel-${index}`;
            panel.setAttribute('aria-labelledby', `accordion-trigger-${index}`);
            panel.setAttribute('role', 'region');
            
            // Move the ul content into the panel
            panel.appendChild(nextUl.cloneNode(true));
            
            // Add button and panel to accordion container
            accordionContainer.appendChild(button);
            accordionContainer.appendChild(panel);
            
            // Replace h3 and ul with accordion
            h3.parentNode.insertBefore(accordionContainer, h3);
            h3.remove();
            nextUl.remove();
            
            // Add click handler
            button.addEventListener('click', function() {
                toggleAccordion(this);
            });
            
            // Add keyboard navigation
            button.addEventListener('keydown', function(e) {
                handleAccordionKeyboard(e, this);
            });
        }
    });
}

function toggleAccordion(button) {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    
    // Update ARIA attributes
    button.setAttribute('aria-expanded', !isExpanded);
    
    // Toggle panel visibility
    if (isExpanded) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');
    }
}

function handleAccordionKeyboard(e, button) {
    const accordions = Array.from(document.querySelectorAll('.accordion-trigger'));
    const currentIndex = accordions.indexOf(button);
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < accordions.length - 1) {
                accordions[currentIndex + 1].focus();
            }
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
                accordions[currentIndex - 1].focus();
            }
            break;
        case 'Home':
            e.preventDefault();
            accordions[0].focus();
            break;
        case 'End':
            e.preventDefault();
            accordions[accordions.length - 1].focus();
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            toggleAccordion(button);
            break;
    }
}

function convertListItemsToCheckboxes() {
    // Find all list items within content__inner that don't already have checkboxes
    const contentInner = document.querySelector('.content__inner');
    const listItems = contentInner.querySelectorAll('li:not(.priority-item):not(.task-list-item)');
    
    let globalIndex = 0; // Use a global counter to ensure unique IDs
    
    listItems.forEach((item) => {
        // Skip if this item already has a checkbox
        if (item.querySelector('input[type="checkbox"]')) {
            return;
        }
        
        // Get the text content of the list item
        const itemText = item.textContent.trim();
        
        // Create a unique ID for the checkbox
        const checkboxId = `list-checkbox-${globalIndex}`;
        globalIndex++; // Increment the global counter
        
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'list-checkbox';
        checkbox.id = checkboxId;
        
        // Create label for the text content
        const textLabel = document.createElement('label');
        textLabel.className = 'list-text';
        textLabel.textContent = itemText;
        textLabel.style.cursor = 'pointer';
        textLabel.setAttribute('for', checkboxId);
        
        // Clear the list item and add checkbox and label
        item.innerHTML = '';
        item.appendChild(checkbox);
        item.appendChild(textLabel);
        
        // Verify the association is working
        console.log(`Created checkbox with ID: ${checkboxId}, label for: ${textLabel.getAttribute('for')}`);
        

    });
}

function handlePriorityItems() {
    // Get all list items within content__inner
    const contentInner = document.querySelector('.content__inner');
    const listItems = contentInner.querySelectorAll('li');
    const priorityDiv = document.querySelector('.priority');
    
    // Create a map to store items by category
    const categoryMap = new Map();
    
    // Track used IDs to avoid conflicts
    const usedIds = new Set();
    
    // Find items with 🔥 and group them by category
    listItems.forEach(item => {
        // Check if the item or its label contains 🔥
        const itemText = item.textContent || '';
        const label = item.querySelector('label');
        const labelText = label ? label.textContent || '' : '';
        
        if (itemText.includes('🔥') || labelText.includes('🔥')) {
            // Get the category name from the accordion trigger before the parent ul
            const parentUl = item.parentElement;
            const accordionPanel = parentUl.closest('.accordion-panel');
            const accordionTrigger = accordionPanel ? 
                accordionPanel.previousElementSibling : null;
            
            const categoryName = accordionTrigger && accordionTrigger.tagName === 'BUTTON' 
                ? accordionTrigger.textContent.replace('🔥', '').trim() 
                : '';
            
            // Add to category map
            if (!categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, []);
            }
            // Use the text from the label if available, otherwise from the item
            const textToAdd = labelText.includes('🔥') ? labelText.replace('🔥', '').trim() : itemText.replace('🔥', '').trim();
            categoryMap.get(categoryName).push(textToAdd);
        }
    });
    
    // Create the priority section structure
    categoryMap.forEach((items, category) => {
        // Create category wrapper div
        const categoryWrapper = document.createElement('div');
        categoryWrapper.className = 'priority-category';
        
        // Create category heading
        const categoryHeading = document.createElement('h2');
        categoryHeading.textContent = category;
        categoryWrapper.appendChild(categoryHeading);
        
        // Create list for this category
        const categoryList = document.createElement('ul');
        categoryList.className = 'priority-list';
        
        items.forEach((itemText, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'priority-item';
            
            // Create checkbox with unique ID
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'priority-checkbox';
            
            // Generate unique ID
            let checkboxId = `priority-checkbox-${category.replace(/\s+/g, '-').toLowerCase()}-${index}`;
            let counter = 1;
            while (usedIds.has(checkboxId)) {
                checkboxId = `priority-checkbox-${category.replace(/\s+/g, '-').toLowerCase()}-${index}-${counter}`;
                counter++;
            }
            usedIds.add(checkboxId);
            checkbox.id = checkboxId;
            
            // Create text wrapper as a proper label
            const textWrapper = document.createElement('label');
            textWrapper.className = 'priority-text';
            textWrapper.textContent = itemText;
            textWrapper.style.cursor = 'pointer';
            textWrapper.setAttribute('for', checkbox.id);
            
            // Add checkbox and text to list item
            listItem.appendChild(checkbox);
            listItem.appendChild(textWrapper);
            
            // Verify the association is working
            console.log(`Created priority checkbox with ID: ${checkboxId}, label for: ${textWrapper.getAttribute('for')}`);
            

            
            categoryList.appendChild(listItem);
        });
        
        categoryWrapper.appendChild(categoryList);
        priorityDiv.appendChild(categoryWrapper);
    });
}

function makeTaskTextClickable() {
    // Find all task list items within content__inner
    const contentInner = document.querySelector('.content__inner');
    const taskItems = contentInner.querySelectorAll('.task-list-item');
    
    let taskIndex = 0; // Use a separate counter for task items
    
    taskItems.forEach((item) => {
        // Find the checkbox within this item
        const checkbox = item.querySelector('.task-list-item-checkbox');
        
        if (checkbox) {
            // Ensure checkbox has an ID for accessibility
            if (!checkbox.id) {
                checkbox.id = `task-checkbox-${taskIndex}`;
                taskIndex++;
            }
            
            // Create a label for the text content
            const textLabel = document.createElement('label');
            textLabel.className = 'task-text';
            textLabel.style.cursor = 'pointer';
            textLabel.setAttribute('for', checkbox.id);
            
            // Move all text nodes and elements after the checkbox into the label
            let nextNode = checkbox.nextSibling;
            while (nextNode) {
                const nodeToMove = nextNode;
                nextNode = nextNode.nextSibling;
                textLabel.appendChild(nodeToMove);
            }
            
            // Add the label after the checkbox
            item.insertBefore(textLabel, checkbox.nextSibling);
            
            // Verify the association is working
            console.log(`Created task checkbox with ID: ${checkbox.id}, label for: ${textLabel.getAttribute('for')}`);
            

        }
    });
} 