// Check Element visibility (multiple selectors)
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

// Check element invisibility / not shown (multiple selectors)
export async function checkElementInvisibility(page, selector, text = null, attribute = null, timeout = 5000) {
    let element;

    if (attribute) {
        element = page.locator(`[${attribute}]`);
    } else if (text) {
        element = page.locator(`${selector}:has-text("${text}")`);
    } else {
        element = page.locator(selector);
    }

    // Wait for the element to be hidden within the timeout
    await element.waitFor({state: 'hidden', timeout});

    const isVisible = await element.isVisible();
    if (isVisible) {
        throw new Error(`Element is still visible: ${selector}`);
    }

    return true;
}


// Verify dropdown item by title
export async function verifyDropdownItemsByTitle(page, attribute, expectedTitles) {
    // Locate the dropdown trigger button using an attribute like name
    const dropdownTrigger = page.locator(`${attribute}`);

    // Click the button to trigger the dropdown list
    await dropdownTrigger.waitFor({state: 'visible'});
    await dropdownTrigger.click();

    // Check for each expected title in the dropdown list
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

// Count the items from a list
export async function countListItems(page, selector) {
    // Wait for the list to be visible
    await page.waitForSelector(selector, {state: 'visible'});

    // Count the number of `li` elements inside the list
    const itemCount = await page.locator(`${selector} li`).count();

    return itemCount;
}

// Verify different list item elements
export async function verifyListItemElements(page, listSelector, itemSelectors) {
    // Wait for the list to be visible
    await page.waitForSelector(listSelector, {state: 'visible'});

    // Obtain the 'li' items count
    const listItems = page.locator(`${listSelector} li`);
    const itemCount = await listItems.count();

    // Loop through each list item and verify the required elements
    for (let i = 0; i < itemCount; i++) {
        const listItem = listItems.nth(i);

        // Avatar
        await listItem.locator(itemSelectors.avatar).waitFor({state: 'visible'});

        // Title
        await listItem.locator(itemSelectors.title).waitFor({state: 'visible'});

        // Status
        await listItem.locator(itemSelectors.status).waitFor({state: 'visible'});

        // Date
        await listItem.locator(itemSelectors.date).waitFor({state: 'visible'});

        // Team
        await listItem.locator(itemSelectors.team).waitFor({state: 'visible'});
    }

    console.log(`Verified: All elements (avatar, title, status, date, team) are present in each of the ${itemCount} list items.`);
}

// Check if the title corresponds to the correct type (using the provided transaction mappings)
export async function verifyTitleCorrespondsToType(actionType, cleanedTitle, transactionMapping) {
    const normalizedActionType = actionType.toUpperCase(); // Normalize to uppercase

    if (transactionMapping[normalizedActionType]) {
        const expectedFormat = transactionMapping[normalizedActionType];

        // Validation logic
        const regex = new RegExp(expectedFormat.replace(/<.*?>/g, '.*'), 'i');
        if (!regex.test(cleanedTitle)) {
            throw new Error(`Title "${cleanedTitle}" does not match expected format for action type "${normalizedActionType}". Expected: ${expectedFormat}`);
        }

        // Log successful match
        console.log(`Matched: Action type "${normalizedActionType}" with title "${cleanedTitle}".`);
    } else {
        throw new Error(`No transaction mapping found for action type "${normalizedActionType}".`);
    }
}

// Click "Load More" button until it's no longer visible and count items after each click
export async function clickLoadMoreUntilNotPresent(page, buttonSelector, listSelector) {
    let previousItemCount = await page.locator(`${listSelector} li`).count();

    // Loop while the "Load More" button is visible
    while (await page.locator(buttonSelector).isVisible()) {
        console.log(`Previous item count: ${previousItemCount}`);

        // Click the "Load More" button
        await page.locator(buttonSelector).click();

        // Wait for more items to load
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

/*

// Select an option for sorting
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
*/


// Sort and verify date ordering (ascending/descending)
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

    // Return result for the asc or desc sorted dates
    const isSorted = order === 'asc'
        ? dates.every((date, i) => i === 0 || date >= dates[i - 1])
        : dates.every((date, i) => i === 0 || date <= dates[i - 1]);

    if (!isSorted) {
        throw new Error(`Days are not sorted in ${order} order.`);
    }

    return true;
}

/*

// Parsing days retrieved from each item
export function parseDaysAgo(daysAgoText) {
    const match = daysAgoText.match(/(\d+) days ago/);
    return match ? parseInt(match[1], 10) : 0; // Parse the number of days
}
*/


// Verify filter by team and check results
export async function verifyTeamFilter(page, teamSelector, expectedTeam) {
    const teams = await page.$$eval(teamSelector, elements => elements.map(el => el.textContent.trim()));

    // Verify all items belong to the expected team
    if (!teams.every(team => team === expectedTeam)) {
        console.log(`These are teams: ${teams}`)
        throw new Error(`Not all items belong to the expected team: ${expectedTeam}`);
    }
    console.log(`teams in list are: ${teams} and expected team is: ${expectedTeam}`)
    return true;
}

// Verify filter by type and check results using transaction mapping
export async function verifyTypeFilter(page, typeSelector, expectedType, transactionMapping) {
    // Fetch all list items
    const items = await page.$$(typeSelector);

    // Log the number of items found
    console.log(`Found ${items.length} result(s) for type: "${expectedType}".`);

    for (const [index, item] of items.entries()) {
        // Get the text content (or HTML) of the list item
        const text = await item.textContent();
        const cleanedTitle = text.trim();

        // Log the index and the text content of the item
        console.log(`Item ${index + 1}: ${cleanedTitle}`);

        // Verify the title matches the expected transaction mapping
        await verifyTitleCorrespondsToType(expectedType, cleanedTitle, transactionMapping);
    }
}

// Check visibility and interaction of popover
export async function togglePopover(page, selector) {
    await checkElementVisibility(page, selector, null, null);
    await page.click(selector);  // Toggle the popover
}

// Verify popover user information
export async function verifyPopoverUserInfo(page, popoverElementSelector, popoverAvatarSelector, userNameSelector, addressSelector, expectedAvatarTitle, expectedUserName, expectedAddress) {
    // Check visibility of popover avatar
    const popoverElement = await checkElementVisibility(page, popoverElementSelector, null, null);

    // Retrieve the avatar title from the popover avatar element
    const popoverAvatarTitle = await page.locator(popoverAvatarSelector).getAttribute('title');

    // Retrieve user name and address from the popover
    const userName = (await page.textContent(userNameSelector)).trim();
    const address = (await page.textContent(addressSelector)).trim();

    // Log the comparison of avatar, user name, and address
    console.log(`Comparing List Item vs Popover:
      Avatar: in list item = ${expectedAvatarTitle} vs in popover = ${popoverAvatarTitle}
      User Name: in list item = @${expectedUserName} vs in popover = ${userName}
      Address: in list item = ${expectedAddress} vs in popover = ${address}`);

    // Verify avatar
    if (!popoverElement) throw new Error('Avatar not visible in popover');
    if (popoverAvatarTitle !== expectedAvatarTitle) throw new Error(`Expected avatar title to be ${expectedAvatarTitle}, but found ${popoverAvatarTitle}`);

    // Verify user name
    if (userName !== `@${expectedUserName}`) throw new Error(`Expected user name to be @${expectedUserName}, but found ${userName}`);

    // Verify address
    if (address !== expectedAddress) throw new Error(`Expected address to be ${expectedAddress}, but found ${address}`);

    console.log(`Verified popover info: Avatar ${popoverAvatarTitle}, User ${userName}, Address ${address}`);
}

// Verify avatar size in popover
export async function verifyAvatarSize(page, avatarSelector, expectedWidth, expectedHeight) {
    // Evaluate the size of the avatar by the provided selector
    const avatarSize = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Avatar element with selector ${selector} not found`);
        }
        return {width: element.clientWidth, height: element.clientHeight};
    }, avatarSelector);

    // Check if the avatar's size matches the expected dimensions
    if (avatarSize.width !== expectedWidth || avatarSize.height !== expectedHeight) {
        throw new Error(`Expected avatar size to be ${expectedWidth}x${expectedHeight}px, but found ${avatarSize.width}x${avatarSize.height}px`);
    }

    // Log the verified size of the avatar
    console.log(`Verified avatar size: ${avatarSize.width}x${avatarSize.height}`);
}


// Verify CSS properties of user name
export async function verifyUserNameCss(userNameLocator) {
    // Evaluate the font weight of the user name
    const fontWeight = await userNameLocator.evaluate((element) => {
        return window.getComputedStyle(element).fontWeight;
    });

    // Evaluate the font size of the user name
    const fontSize = await userNameLocator.evaluate((element) => {
        return window.getComputedStyle(element).fontSize;
    });

    // Evaluate the color of the user name
    const color = await userNameLocator.evaluate((element) => {
        return window.getComputedStyle(element).color;
    });

    // Validate the CSS properties against the expected values
    if (fontWeight !== '700' || fontSize !== '13px' || color !== 'rgb(254, 94, 124)') {
        throw new Error(`Expected user name font weight 700, font size 13px, color rgb(254, 94, 124), but found ${fontWeight}, ${fontSize}, ${color}`);
    }

    // Log the verified values
    console.log(`Verified user name CSS: font-weight ${fontWeight}, font-size ${fontSize}, color ${color}`);
}















