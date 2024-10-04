const {expect} = require('@playwright/test');
const {
    checkElementVisibility,
    verifyDropdownItemsByTitle,
    countListItems,
    verifyListItemElements,
    verifyTitleCorrespondsToType,
    clickLoadMoreUntilNotPresent,
    verifyTeamFilter,
    verifyTypeFilter,
    togglePopover,
    verifyPopoverUserInfo,
    verifyAvatarSize,
    verifyUserNameCss,
    checkElementInvisibility,
} = require('../helpers/helper');
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
            teamIndicator: '.ActionsListItem_domain__OhVrH',
            typeIndicator: '.ActionsListItem_title__Jp-yM',
            daysAgoIndicator: '.TransactionMeta_items__XdAqG',
            listItemsLi: '.ActionsList_main__sMpx5 li',
            teamSelector: 'ul[class*="SelectListBox_baseTheme__nxgvD"]',
            typeSelector: 'ul[class*="SelectListBox_themeAlt__YLxZd"]',
            popoverElement: '.InfoPopover_section__E0nuB',
            popoverAvatar: '.InfoPopover_container__xTkDS figure.Avatar_main__PsBO0',
            popoverUserName: '.InfoPopover_userName__pul-M span',
            popoverAddress: '.InfoPopover_address__Rn9NS',
            totalFunds: '.TotalFunds_selectedTokenAmount__NZwsa',
            listItemAvatar: '.Avatar_s__j\\+8wW',
        };
    }

    // Navigate to a page
    async navigate(path = '/') {
        await this.page.goto(path); // Relative to baseURL
        console.log(`Navigating to: ${this.page.url()}`);
    }

    // Verify navigated to a page
    async navigatedToPage(expectedPath = '/') {
        const currentUrl = this.page.url();
        expect(currentUrl).toMatch(expectedPath);
        console.log(`Navigated to: ${currentUrl}`);
    }

    // Verify list components are rendered
    async verifyListComponents() {
        await checkElementVisibility(this.page, this.selectors.list);
        await checkElementVisibility(this.page, this.selectors.loadMoreButton);

        await checkElementVisibility(this.page, this.selectors.teamFilter, null, null);
        await checkElementVisibility(this.page, this.selectors.sortFilter, null, null,);
        await checkElementVisibility(this.page, this.selectors.typeFilter, null, null,);

        const listItems = await this.page.$$(this.selectors.listItems);
        if (!listItems.length) {
            throw new Error('No list items found');
        }
    }

    // Verify the different filter options
    async verifyFilterOptions() {
        const expectedTitlesTeamFilter = ['All Teams', 'Root', 'Normandy', 'Koprulu'];
        const expectedTitlesSortFilter = ['Newest', 'Oldest'];
        const expectedTitlesTypeFilter = ['All', 'Payment', 'Mint', 'Transfer', 'Reputation'];


        await verifyDropdownItemsByTitle(
            this.page,
            this.selectors.teamFilter,
            expectedTitlesTeamFilter
        );

        await verifyDropdownItemsByTitle(
            this.page,
            this.selectors.sortFilter,
            expectedTitlesSortFilter
        );

        await verifyDropdownItemsByTitle(
            this.page,
            this.selectors.typeFilter,
            expectedTitlesTypeFilter
        );
    }

    // Verify the number of list items
    async verifyInitialListItemCount(expectedCount = 10) {
        const itemCount = await countListItems(this.page, this.selectors.list);

        if (itemCount !== expectedCount) {
            throw new Error(`Expected ${expectedCount} items, but found ${itemCount}`);
        }

        console.log(`Verified: ${itemCount} items are displayed on the initial load.`);
    }

    // Verify the List items elements
    async verifyListItemsElements() {
        const {list, avatar, title, status, date, team} = this.selectors;
        const itemSelectors = {avatar, title, status, date, team};
        await verifyListItemElements(this.page, list, itemSelectors);
    }

    // Verify The Titles and Types of the List elements
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

// Sort by date and verify sorting order
    async verifySortingByDate(order = 'asc') {
        const sortOption = order === 'asc' ? 'Oldest' : 'Newest';
        await this.page.click(this.selectors.sortFilter);

        const option = this.page.locator(`li[title="${sortOption}"]`);
        await option.waitFor();
        await option.hover();
        await option.click({force: true});

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
            await option.click({force: true});

            // Wait for items to load after sorting
            //await this.page.waitForTimeout(1000);

            await item.click(); // Click the item

            // Wait for the details page to load
            //await this.page.waitForTimeout(800);

            // Extract "days ago" from the details page
            const daysAgoElement = await this.page.locator(this.selectors.daysAgoIndicator);
            const daysAgoText = await daysAgoElement.innerText();
            const daysAgo = this.parseDaysAgo(daysAgoText);
            daysArray.push(daysAgo);

            // Go back to the previous page
            await this.page.goBack();
            //await this.page.waitForTimeout(800); // Wait for the list to reload
        }

        console.log(`days array is: ${daysArray}`);
        return daysArray; // Return the collected days
    }

    // Parse the "days ago" text into a number
    parseDaysAgo(daysAgoText) {
        const match = daysAgoText.match(/(\d+) days ago/);
        return match ? parseInt(match[1], 10) : 0; // Parse the number of days
    }

    // Filter by team and verify results
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
        await option.click({force: true}); // Force the click, even if Playwright thinks it's not ready

        // Verify the correct team filter has been applied
        await verifyTeamFilter(this.page, this.selectors.teamIndicator, expectedTeam);
    }


    // Filter by type and verify results using transaction mapping
    async filterByType(expectedType) {
        await checkElementVisibility(this.page, this.selectors.typeFilter, null, null);
        await this.page.click(this.selectors.typeFilter);

        // Wait for the dropdown to appear (with better specificity for the dropdown list)
        await this.page.waitForSelector(this.selectors.typeSelector);

        const option = this.page.locator(`li[title="${expectedType}"]`);
        await option.waitFor(); // Wait for the option to be visible
        await option.hover(); // Hover over the element to ensure it’s focused
        await option.click({force: true}); // Force the click, even if Playwright thinks it's not ready
        await verifyTypeFilter(this.page, this.selectors.typeIndicator, expectedType, transactionMapping);
    }

    // Verify combination of team, type, and date sorting
    async verifyCombinedFilters(expectedTeam, expectedType, order = 'asc') {
        await this.filterByTeam(expectedTeam);
        await this.filterByType(expectedType);
        //await this.verifySortingByDate(order);
    }

    // Open the popover for an item
    async openPopover(index) {
        const listItem = this.page.locator(this.selectors.listItems).nth(index);
        const avatar = listItem.locator(this.selectors.avatar);
        await avatar.click()
        await togglePopover(this.page, this.selectors.popoverElement);
    }

    // Close the popover for an item
    async closePopover(index) {
        const listItem = this.page.locator(this.selectors.listItems).nth(index);
        const avatar = listItem.locator(this.selectors.avatar);
        await avatar.click()
        await togglePopover(this.page, this.selectors.popoverElement);
        await this.page.locator(this.selectors.totalFunds).click()
        await checkElementInvisibility(this.page, this.selectors.popoverElement);
    }

    // Verify user information in the popover
    async verifyPopoverUserInfo(index) {
        const listItem = this.page.locator(this.selectors.listItems).nth(index);

        // Extracting avatar, userName, and address from list item
        const avatar = await listItem.locator(this.selectors.listItemAvatar).nth(0).getAttribute('title');
        const userName = await listItem.locator(this.selectors.listItemAvatar).nth(0).getAttribute('data-username');
        const address = await listItem.locator(this.selectors.listItemAvatar).nth(0).getAttribute('data-wallet-address');

        // Locators for popover's content
        const popoverElement = this.selectors.popoverElement;
        const popoverAvatar = this.selectors.popoverAvatar;
        const popoverUserName = this.selectors.popoverUserName;
        const popoverAddress = this.selectors.popoverAddress;

        // Verifying the popover reflects the user details from the list item
        await verifyPopoverUserInfo(this.page, popoverElement, popoverAvatar, popoverUserName, popoverAddress, avatar, userName, address);
    }


    // Verify avatar size
    async verifyAvatarSize(index) {
        const listItem = this.page.locator(this.selectors.listItems).nth(index);
        // Select the avatar within the popover
        const popoverAvatar = this.page.locator(this.selectors.popoverAvatar);

        // Verify the avatar size (34x34)
        await verifyAvatarSize(this.page, this.selectors.popoverAvatar, 34, 34);
    }

    // Verify user name CSS properties
    async verifyUserNameCss(index) {
        // Get the popover user name locator
        const listItem = this.page.locator(this.selectors.listItems).nth(index);
        const popoverUserName = listItem.locator(this.selectors.popoverUserName);

        // Pass the popover user name locator to the helper function
        await verifyUserNameCss(popoverUserName);
    }


}

module.exports = ListPage;
