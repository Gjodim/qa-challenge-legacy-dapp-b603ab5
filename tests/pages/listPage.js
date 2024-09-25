const { expect } = require('@playwright/test');
const { checkElementVisibility, verifyDropdownItemsByTitle, countListItems, verifyListItemElements, verifyTitleCorrespondsToType} = require('../helpers/helper');
const transactionMapping = require('../data/transactionMapping');

class ListPage {
    constructor(page) {
        this.page = page;
        this.selectors = {
            list: '.ActionsList_main__sMpx5',
            listItems: '.ActionsListItem_main__79wRQ',
            loadMoreButton: '.LoadMoreButton_loadMoreButton__nQLWX',
            teamFilter: 'name="filteredDomainId"',
            sortFilter: 'name="sortFilter"',
            typeFilter: 'name="actionTypeFilter"',
            avatar: '.ActionsListItem_avatar__ASfBu', // Avatar selector
            title: '.ActionsListItem_title__Jp-yM', // Title selector
            actionType: 'data-action-type', // Action type selector
            status: '.ActionsListItem_tagWrapper__OzXps', // Status (tag wrapper) selector
            date: '.ActionsListItem_day__zIi1u', // Date selector
            team: '.ActionsListItem_domain__OhVrH', // Team (domain) selector
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
        await checkElementVisibility(this.page, null, null, this.selectors.teamFilter);
        await checkElementVisibility(this.page, null, null, this.selectors.sortFilter);
        await checkElementVisibility(this.page, null, null, this.selectors.typeFilter);

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

            // Extract the title text
            const titleElement = listItem.locator(this.selectors.title);
            const titleText = (await titleElement.allInnerTexts()).join(' ').trim();

            // Clean up any extra spaces between words
            const cleanedTitle = titleText.replace(/\s+/g, ' ');

            // Call the helper function to verify the title corresponds to the action type
            await verifyTitleCorrespondsToType(actionType, cleanedTitle, transactionMapping);


        }
    }

}

module.exports = ListPage;
