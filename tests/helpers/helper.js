// helper.js
const transactionMapping = require('../data/transactionMapping');

export async function checkElementVisibility(page, selector, text = null, attribute = null, timeout = 5000) {
    let element;

    if (attribute) {
        // Find the element with the specified attribute and its value (e.g., name="filteredDomainId")
        element = page.locator(`[${attribute}]`);
    } else if (text) {
        // Find the element containing the specified text within the selector
        element = page.locator(`${selector}:has-text("${text}")`);
    } else {
        // Default to using the provided selector
        element = page.locator(selector);
    }

    // Wait for the element to be visible within the timeout
    await element.waitFor({state: 'visible', timeout});

    if (!await element.count()) {
        throw new Error(`Element not found: ${selector}`);
    }

    const isVisible = await element.isVisible();
    if (!isVisible) {
        throw new Error(`Element is not visible: ${selector}`);
    }

    return true;
}


// helper.js
export async function verifyDropdownItemsByTitle(page, attribute, expectedTitles) {
    // Step 1: Locate the dropdown trigger button using an attribute like name
    const dropdownTrigger = page.locator(`[${attribute}]`);

    // Step 2: Click the button to trigger the dropdown list
    await dropdownTrigger.waitFor({ state: 'visible' });
    await dropdownTrigger.click();

    // Step 4: Check for each expected title in the dropdown list
    for (const title of expectedTitles) {
        const itemLocator = page.locator(`li[title="${title}"]`);
        const isVisible = await itemLocator.isVisible();

        if (!isVisible) {
            throw new Error(`Dropdown item with title "${title}" not found or not visible`);
        } else {
            console.log(`Dropdown item with title "${title}" is visible`);
        }
    }

    console.log(`All expected items found: ${expectedTitles}`);
}

export async function countListItems(page, selector) {
    // Step 1: Wait for the list to be visible
    await page.waitForSelector(selector, { state: 'visible' });

    // Step 2: Count the number of `li` elements inside the list
    const itemCount = await page.locator(`${selector} li`).count();

    return itemCount;
}

export async function verifyListItemElements(page, listSelector, itemSelectors) {
    // Step 1: Wait for the list to be visible
    await page.waitForSelector(listSelector, { state: 'visible' });

    // Step 2: Loop through each list item and verify the required elements
    const listItems = page.locator(`${listSelector} li`);
    const itemCount = await listItems.count();

    for (let i = 0; i < itemCount; i++) {
        const listItem = listItems.nth(i);

        // Avatar
        await listItem.locator(itemSelectors.avatar).waitFor({ state: 'visible' });

        // Title
        await listItem.locator(itemSelectors.title).waitFor({ state: 'visible' });

        // Status
        await listItem.locator(itemSelectors.status).waitFor({ state: 'visible' });

        // Date
        await listItem.locator(itemSelectors.date).waitFor({ state: 'visible' });

        // Team
        await listItem.locator(itemSelectors.team).waitFor({ state: 'visible' });
    }

    console.log(`Verified: All elements (avatar, title, status, date, team) are present in each of the ${itemCount} list items.`);
}

// Function to check if the title corresponds to the correct type
export async function verifyTitleCorrespondsToType(actionType, cleanedTitle, transactionMapping) {

    if (transactionMapping[actionType]) {
        const expectedFormat = transactionMapping[actionType];

        // Simple validation logic (this can be customized as needed)
        const regex = new RegExp(expectedFormat.replace(/<.*?>/g, '.*'), 'i');
        if (!regex.test(cleanedTitle)) {
            throw new Error(`Title "${cleanedTitle}" does not match expected format for action type "${actionType}". Expected: ${expectedFormat}`);
        }

        // Log successful match
        console.log(`Matched: Action type "${actionType}" with title "${cleanedTitle}".`);
    } else {
        throw new Error(`No transaction mapping found for action type "${actionType}".`);
    }
}











