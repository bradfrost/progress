document.addEventListener('DOMContentLoaded', function() {
    // Create section wrappers for multi-column layout
    createSectionWrappers();
    
    // Create accordions from h3 + ul pairs
    createAccordions();
    
    // Handle priority items (existing functionality)
    handlePriorityItems();
    
    // Make task text clickable
    makeTaskTextClickable();
});

function createSectionWrappers() {
    const container = document.querySelector('.container');
    const h2Elements = container.querySelectorAll('h2');
    
    // Find the horizontal rule (hr element)
    const hrElement = container.querySelector('hr');
    
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
            while (currentElement && currentElement !== container) {
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
                    sibling = sibling.nextElementSibling;
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
    
    // Insert the grids in the correct order
    if (topGrid.children.length > 0) {
        // Insert top grid after the priority section
        const prioritySection = container.querySelector('.priority');
        if (prioritySection) {
            container.insertBefore(topGrid, prioritySection.nextSibling);
        } else {
            container.insertBefore(topGrid, container.firstChild);
        }
    }
    
    if (bottomGrid.children.length > 0) {
        // Insert bottom grid after the hr
        if (hrElement) {
            container.insertBefore(bottomGrid, hrElement.nextSibling);
        } else {
            container.appendChild(bottomGrid);
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

function handlePriorityItems() {
    // Get all list items
    const listItems = document.querySelectorAll('li');
    const priorityDiv = document.querySelector('.priority');
    
    // Create a map to store items by category
    const categoryMap = new Map();
    
    // Find items with 🔥 and group them by category
    listItems.forEach(item => {
        if (item.textContent.includes('🔥')) {
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
}

function makeTaskTextClickable() {
    // Find all task list items
    const taskItems = document.querySelectorAll('.task-list-item');
    
    taskItems.forEach(item => {
        // Find the checkbox within this item
        const checkbox = item.querySelector('.task-list-item-checkbox');
        
        if (checkbox) {
            // Create a wrapper for the text content
            const textWrapper = document.createElement('span');
            textWrapper.className = 'task-text';
            textWrapper.style.cursor = 'pointer';
            
            // Move all text nodes and elements after the checkbox into the wrapper
            let nextNode = checkbox.nextSibling;
            while (nextNode) {
                const nodeToMove = nextNode;
                nextNode = nextNode.nextSibling;
                textWrapper.appendChild(nodeToMove);
            }
            
            // Add the wrapper after the checkbox
            item.insertBefore(textWrapper, checkbox.nextSibling);
            
            // Add click handler to the text wrapper
            textWrapper.addEventListener('click', function(e) {
                // Don't trigger if clicking on the checkbox itself
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    // Trigger change event for any listeners
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        }
    });
} 