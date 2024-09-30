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
    const dropdownTrigger = page.locator(`${attribute}`);

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

// Helper to click "Load More" button until it's no longer visible and count items after each click
export async function clickLoadMoreUntilNotPresent(page, buttonSelector, listSelector) {
    let previousItemCount = await page.locator(`${listSelector} li`).count();

    // Loop while the "Load More" button is visible
    while (await page.locator(buttonSelector).isVisible()) {
        console.log(`Previous item count: ${previousItemCount}`);

        // Click the "Load More" button
        await page.locator(buttonSelector).click();

        // Wait for more items to load (you can adjust the timeout if necessary)
        //await page.waitForTimeout(2000); // This is to give time for new items to load

        // Get the new item count
        let newItemCount = await page.locator(`${listSelector} li`).count();
        console.log(`New item count: ${newItemCount}`);

        // Ensure new items have been loaded
        if (newItemCount <= previousItemCount) {
            throw new Error('No new items loaded after clicking "Load More".');
        }

        // Update the previous item count to the current one
        previousItemCount = newItemCount;

        // Check if the button is still visible
        if (!(await page.locator(buttonSelector).isVisible())) {
            console.log('"Load More" button is no longer visible.');
            break;
        }
    }
}

export async function selectSortOption(page, sortSelector, optionText) {
    // Click the sort filter button
    await page.click(sortSelector);

    // Select the option based on the provided text
    const optionLocator = `li[role="option"]:has-text("${optionText}")`;
    await optionLocator.waitFor(); // Wait for the option to be visible
    await optionLocator.hover(); // Hover over the element to ensure it’s focused
    await optionLocator.click({ force: true }); // Force the click, even if Playwright thinks it's not ready
    //await page.click(optionLocator);
}


// Helper to sort and verify date ordering (ascending/descending)
export async function verifyDaysSorting(page, daysSelector, order = 'asc') {
    const daysText = await page.$$eval(daysSelector, elements => {
        return elements.map(el => {
            const text = el.textContent.trim();
            // Extract the number of days from the "X days ago" format
            const match = text.match(/(\d+) days ago/);
            return match ? parseInt(match[1], 10) : null;
        }).filter(Boolean); // Filter out any null values
    });

    console.log('Parsed days:', daysText);

    // Create an array of dates based on the days ago values
    const dates = daysText.map(days => {
        const date = new Date();
        date.setDate(date.getDate() - days); // Subtract days from today
        return date;
    });

    const isSorted = order === 'asc'
        ? dates.every((date, i) => i === 0 || date >= dates[i - 1])
        : dates.every((date, i) => i === 0 || date <= dates[i - 1]);

    if (!isSorted) {
        throw new Error(`Days are not sorted in ${order} order.`);
    }

    return true;
}


export function parseDaysAgo(daysAgoText) {
    const match = daysAgoText.match(/(\d+) days ago/);
    return match ? parseInt(match[1], 10) : 0; // Parse the number of days
}


// Helper to filter by team and check results
export async function verifyTeamFilter(page, teamSelector, expectedTeam) {
    const teams = await page.$$eval(teamSelector, elements => elements.map(el => el.textContent.trim()));

    // Verify all items belong to the expected team
    if (!teams.every(team => team === expectedTeam)) {
        console.log(`These are teams: ${teams}`)
        throw new Error(`Not all items belong to the expected team: ${expectedTeam}`);
    }

    return true;
}

// Helper to filter by type and check results using transaction mapping
export async function verifyTypeFilter(page, typeSelector, expectedType, transactionMapping) {
    const items = await page.$$(typeSelector);

    for (const item of items) {
        const text = await item.textContent();
        const cleanedTitle = text.trim();
        await verifyTitleCorrespondsToType(expectedType, cleanedTitle, transactionMapping);
    }
}












