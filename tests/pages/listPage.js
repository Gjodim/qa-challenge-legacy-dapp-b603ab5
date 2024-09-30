const { expect } = require('@playwright/test');
const { checkElementVisibility, verifyDropdownItemsByTitle, countListItems, verifyListItemElements, verifyTitleCorrespondsToType, clickLoadMoreUntilNotPresent, verifyDateSorting, verifyTeamFilter, verifyTypeFilter, selectSortOption, verifyDaysSorting} = require('../helpers/helper');
const transactionMapping = require('../data/transactionMapping');

class ListPage {
    constructor(page) {
        this.page = page;
        this.selectors = {
            list: '.ActionsList_main__sMpx5',
            listItems: '.ActionsListItem_main__79wRQ',
            loadMoreButton: 'button:has-text("Load More")',
            teamFilter: 'button[name="filteredDomainId"]',
            sortFilter: 'button[name="sortFilter"]',
            typeFilter: 'button[name="actionTypeFilter"]',
            avatar: '.ActionsListItem_avatar__ASfBu', // Avatar selector
            title: '.ActionsListItem_title__Jp-yM', // Title selector
            actionType: 'data-action-type', // Action type selector
            status: '.ActionsListItem_tagWrapper__OzXps', // Status (tag wrapper) selector
            date: '.ActionsListItem_day__zIi1u', // Date selector
            team: '.ActionsListItem_domain__OhVrH', // Team (domain) selector
            dateSelector: '.ActionsListItem_day__zIi1u',
            teamIndicator: '.ActionsListItem_domain__OhVrH',
            typeIndicator: '.ActionsListItem_action__label',
            daysAgoIndicator: '.TransactionMeta_items__XdAqG',
            listItemsLi: '.ActionsList_main__sMpx5 li',
            teamSelector: 'ul[class*="SelectListBox_baseTheme__nxgvD"]',
            typeSelector: 'ul[class*="SelectListBox_themeAlt__YLxZd"]',
        };
    }

    async navigate(path = '/') {
        await this.page.goto(path); // Relative to baseURL
        console.log(`Navigating to: ${this.page.url()}`);
    }

    async navigatedToPage(expectedPath = '/') {
        const currentUrl = this.page.url();
        expect(currentUrl).toMatch(expectedPath);
        console.log(`Navigated to: ${currentUrl}`);
    }

    // Function to verify list components are rendered
    // listPage.js
    async verifyListComponents() {
        // Check the visibility of the list and other components
        await checkElementVisibility(this.page, this.selectors.list);
        await checkElementVisibility(this.page, this.selectors.loadMoreButton);

        // Use the 'name' attribute to locate the filter dropdown
        await checkElementVisibility(this.page, this.selectors.teamFilter,null, null);
        await checkElementVisibility(this.page, this.selectors.sortFilter, null, null, );
        await checkElementVisibility(this.page, this.selectors.typeFilter, null, null, );

        // Check if the list items exist
        const listItems = await this.page.$$(this.selectors.listItems);
        if (!listItems.length) {
            throw new Error('No list items found');
        }
    }


    // listPage.js
    async verifyFilterOptions() {
        const expectedTitlesTeamFilter = ['All Teams', 'Root', 'Normandy', 'Koprulu'];
        const expectedTitlesSortFilter = ['Newest', 'Oldest'];
        const expectedTitlesTypeFilter = ['All', 'Payment', 'Mint', 'Transfer', 'Reputation'];


        // Verify if all the expected titles exist in the dropdown
        await verifyDropdownItemsByTitle(
            this.page,
            this.selectors.teamFilter, // Attribute used to find the button
            expectedTitlesTeamFilter // List of expected items
        );

        await verifyDropdownItemsByTitle(
            this.page,
            this.selectors.sortFilter, // Attribute used to find the button
            expectedTitlesSortFilter // List of expected items
        );

        await verifyDropdownItemsByTitle(
            this.page,
            this.selectors.typeFilter, // Attribute used to find the button
            expectedTitlesTypeFilter // List of expected items
        );
    }

    // Function to verify the number of list items
    async verifyInitialListItemCount(expectedCount = 10) {
        const itemCount = await countListItems(this.page, this.selectors.list);

        if (itemCount !== expectedCount) {
            throw new Error(`Expected ${expectedCount} items, but found ${itemCount}`);
        }

        console.log(`Verified: ${itemCount} items are displayed on the initial load.`);
    }

    async verifyListItemsElements() {
        const { list, avatar, title, status, date, team } = this.selectors;
        const itemSelectors = { avatar, title, status, date, team };
        await verifyListItemElements(this.page, list, itemSelectors);
    }

    async verifyTitlesAndTypes() {
        const listItems = this.page.locator(`${this.selectors.list} li`);
        const itemCount = await listItems.count();
        console.log(`Item count is: ${itemCount.toString()}`)

        for (let i = 0; i < itemCount; i++) {
            const listItem = listItems.nth(i);

            // Extract action type from the list item attribute
            const actionType = await listItem.getAttribute(this.selectors.actionType);

            // Check if the action type is 'GENERIC'
            if (actionType === 'GENERIC') {
                throw new Error(`Found a list item with action type 'GENERIC' which should not exist.`);
            }

            // Extract the title text
            const titleElement = listItem.locator(this.selectors.title);
            const titleText = (await titleElement.allInnerTexts()).join(' ').trim();

            // Clean up any extra spaces between words
            const cleanedTitle = titleText.replace(/\s+/g, ' ');

            // Call the helper function to verify the title corresponds to the action type
            await verifyTitleCorrespondsToType(actionType, cleanedTitle, transactionMapping);


        }
    }

    // Get current count of list items
    async getItemCount() {
        const count = await countListItems(this.page, this.selectors.list);
        console.log(`Item count: ${count}`);
        return count;
    }

    // Click "Load More" until button disappears, counting items along the way
    async clickLoadMoreUntilHidden() {
        await clickLoadMoreUntilNotPresent(this.page, this.selectors.loadMoreButton, this.selectors.list);
    }

// Function to sort by date and verify sorting order
    async verifySortingByDate(order = 'asc') {
        const sortOption = order === 'asc' ? 'Oldest' : 'Newest';
        await this.page.click(this.selectors.sortFilter);

        const option = this.page.locator(`li[title="${sortOption}"]`);
        await option.waitFor();
        await option.hover();
        await option.click({ force: true });

        // Wait for items to load after sorting
        await this.page.waitForTimeout(500);

        const daysArray = [];
        const items = this.page.locator(this.selectors.listItemsLi);

        // Get the total count of items in the list
        const itemCount = await items.count();
        console.log(`Total number of items to iterate through is ${itemCount}`);

        for (let i = 0; i < itemCount; i++) {
            const item = items.nth(i); // Get the nth item in the list

            // Reapply the sorting filter each time after going back
            await this.page.click(this.selectors.sortFilter);
            await option.waitFor();
            await option.hover();
            await option.click({ force: true });

            // Wait for items to load after sorting
            await this.page.waitForTimeout(1000);

            await item.click(); // Click the item

            // Wait for the details page to load
            await this.page.waitForTimeout(800);

            // Extract "days ago" from the details page
            const daysAgoElement = await this.page.locator(this.selectors.daysAgoIndicator);
            const daysAgoText = await daysAgoElement.innerText();
            const daysAgo = this.parseDaysAgo(daysAgoText);
            daysArray.push(daysAgo);

            // Go back to the previous page
            await this.page.goBack();
            await this.page.waitForTimeout(800); // Wait for the list to reload
        }

        console.log(`days array is: ${daysArray}`);
        return daysArray; // Return the collected days
    }

    // Parse the "days ago" text into a number
    parseDaysAgo(daysAgoText) {
        const match = daysAgoText.match(/(\d+) days ago/);
        return match ? parseInt(match[1], 10) : 0; // Parse the number of days
    }

    // Function to filter by team and verify results
    async filterByTeam(expectedTeam) {
        // Ensure the team filter button is visible and click it
        await checkElementVisibility(this.page, this.selectors.teamFilter, null, null);
        await this.page.click(this.selectors.teamFilter);

        // Wait for the dropdown to appear (with better specificity for the dropdown list)
        await this.page.waitForSelector(this.selectors.teamSelector);

        // Adding a slight delay to ensure the dropdown is fully loaded (optional)
        //await this.page.waitForTimeout(500);

        // Now click the correct team option by matching the `title` attribute
        const option = this.page.locator(`li[title="${expectedTeam}"]`);
        //const availableTeams = await this.page.$$eval('li[role="option"]', elements => elements.map(el => el.getAttribute('title')));
        //console.log('Available teams:', availableTeams);
        await option.waitFor(); // Wait for the option to be visible
        await option.hover(); // Hover over the element to ensure it’s focused
        await option.click({ force: true }); // Force the click, even if Playwright thinks it's not ready

        // Verify the correct team filter has been applied
        await verifyTeamFilter(this.page, this.selectors.teamIndicator, expectedTeam);
    }


    // Function to filter by type and verify results using transaction mapping
    async filterByType(expectedType) {
        await checkElementVisibility(this.page, this.selectors.typeFilter, null, null);
        await this.page.click(this.selectors.typeFilter);

        // Wait for the dropdown to appear (with better specificity for the dropdown list)
        await this.page.waitForSelector(this.selectors.typeSelector);

        const option = this.page.locator(`li[title="${expectedType}"]`);
        await option.waitFor(); // Wait for the option to be visible
        await option.hover(); // Hover over the element to ensure it’s focused
        await option.click({ force: true }); // Force the click, even if Playwright thinks it's not ready
        await verifyTypeFilter(this.page, this.selectors.typeIndicator, expectedType, transactionMapping);
    }

    // Function to verify combination of team, type, and date sorting
    async verifyCombinedFilters(expectedTeam, expectedType, order = 'asc') {
        await this.filterByTeam(expectedTeam);
        await this.filterByType(expectedType);
        await this.verifySortingByDate(order);
    }

}

module.exports = ListPage;
