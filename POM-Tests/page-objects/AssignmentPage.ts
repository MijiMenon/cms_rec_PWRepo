import { expect, type FrameLocator, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base/BasePage';
import { logger } from '../../POM-Framework/utilities/logger';
import { WaitCondition } from '../../POM-Framework/interfaces/index';

export interface DebtorDetails {
    businessName: string;
    address: string;
    province: string;
    zipCode: string;
    city: string;
    srfNumber: string;
}

export interface AgreementDetails {
    securityAgreement: string;
    agreement: string;
    transit: string;
    loanNumber: string;
    locationCode: string;
    districtCode: string;
    originalLoanBalance: string;
    balanceOwing: string;
    arrears: string;
}

export interface AssignmentData {
    debtorDetails: DebtorDetails;
    agreementDetails: AgreementDetails;
}

export class AssignmentPage extends BasePage {
    readonly page: Page;
    readonly frame: FrameLocator;
    readonly pageUrl: string = '';
    readonly welcomeNote: Locator;
    readonly assignmentMenu: Locator;
    readonly manualMenu: Locator;
    readonly newAssignmnetButton: Locator;
    readonly debtorType: Locator;
    readonly businessName: Locator;
    readonly address: Locator;
    readonly province: Locator;
    readonly locatorProvince: string;
    readonly zipCode: Locator;
    readonly city: Locator;
    readonly country: Locator;
    readonly srfNumber: Locator;
    readonly agreementTab: Locator;
    readonly securityAgreement: Locator;
    readonly agreement: Locator;
    readonly transit: Locator;
    readonly loanNumber: Locator;
    readonly locationCode: Locator;
    readonly districtCode: Locator;
    readonly submitButton: Locator;
    readonly originalLoanBalance: Locator;
    readonly balanceOwing: Locator;
    readonly arrears: Locator;
    readonly logout: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.frame = this.page.frameLocator('frame[name="middle"]');
        this.welcomeNote = this.frame.locator('.welcome');
        this.assignmentMenu = this.frame.getByText('Assignment');
        this.manualMenu = this.frame.getByText('Manual');
        this.newAssignmnetButton = this.frame.locator('id=btnNewAssignment');
        this.debtorType = this.frame.locator('id=rbBusiness');
        this.businessName = this.frame.locator('#txtBusName');
        this.address = this.frame.locator('id=txtAddress');
        this.province = this.frame.locator('id=ddlProvince');
        this.locatorProvince = 'select#ddlProvince';
        this.zipCode = this.frame.locator('id=txtPostalCode');
        this.city = this.frame.locator('id=txtCity');
        this.country = this.frame.locator('id=ddlCountry');
        this.srfNumber = this.frame.locator('id=txtSRFBusiness');
        this.agreementTab = this.frame.locator('id=tabAgreement');
        this.securityAgreement = this.frame.locator('id=ddlAgreementType');
        this.agreement = this.frame.locator('id=ddlAgreement');
        this.transit = this.frame.locator('#txtBranchNumber');
        this.loanNumber = this.frame.locator('id=txtLoanNumber');
        this.locationCode = this.frame.locator('xpath=//*[@id="txtOtherNumber"]');
        this.districtCode = this.frame.locator('id=txtDistrictCode');
        this.submitButton = this.frame.locator('id=btnSave');
        this.originalLoanBalance = this.frame.locator('id=txtOriginalBalance');
        this.balanceOwing = this.frame.locator('#txtBalanceOwing');
        this.arrears = this.frame.locator('id=txtArrears');
        this.logout = this.frame.getByText('Logout');
    }

    async logFramePresence() {
        const frameExists = await this.page.locator('frame[name="middle"]').count();
        logger.info(`Number of frames with name="middle": ${frameExists}`);
    }

    async verifyWelcomeNote() {
        try {
            const isExists = await this.welcomeNote.isVisible({ timeout: 10000 });
            logger.info(`Welcome Note Displayed: ${isExists}`);
        } catch (error) {
            logger.error('Welcome note not found or frame not loaded yet:', error);
        }
    }

    /**
     * Wait for frame to be fully loaded and stable
     */
    async waitForFrameStable(): Promise<void> {
        logger.info('Waiting for frame to be stable');

        try {
            // Wait for frame element to exist
            await this.page.waitForSelector('frame[name="middle"]', {
                state: 'attached',
                timeout: 30000
            });

            // Additional wait for frame initialization
            await this.page.waitForTimeout(2000);

            logger.info('Frame is stable and ready');
        } catch (error) {
            logger.error(`Frame did not stabilize: ${error}`);
            throw error;
        }
    }

    async openManualAssignment() {
        logger.info('Opening manual assignment');

        try {
            // Wait for frame to be loaded
            logger.info('Waiting for middle frame to load');
            await this.page.waitForLoadState('networkidle');
            await this.page.waitForTimeout(2000); // Allow time for frame content to initialize

            // Hover over Assignment menu
            logger.info('Hovering over Assignment menu');
            await this.assignmentMenu.waitFor({ state: 'visible', timeout: 15000 });
            await this.assignmentMenu.hover();
            await this.page.waitForTimeout(500); // Wait for submenu to appear

            // Click Manual option
            logger.info('Clicking Manual menu option');
            await this.manualMenu.waitFor({ state: 'visible', timeout: 5000 });
            await this.manualMenu.click();

            // Wait for page navigation after clicking Manual
            logger.info('Waiting for navigation after clicking Manual');
            await this.page.waitForTimeout(2000);

            // Wait for New Assignment button
            logger.info('Waiting for New Assignment button');
            await this.newAssignmnetButton.waitFor({ state: 'visible', timeout: 15000 });

            // Click New Assignment button
            logger.info('Clicking New Assignment button');
            await this.newAssignmnetButton.click();

            // Wait for potential navigation/frame reload
            logger.info('Waiting for navigation after button click');
            await this.page.waitForLoadState('networkidle', { timeout: 45000 });
            await this.page.waitForTimeout(3000); // Additional buffer for frame initialization

            // Wait for frame to be stable after navigation
            await this.waitForFrameStable();

            // Wait for debtor type with retry logic
            logger.info('Waiting for debtor type radio button');
            let retryCount = 0;
            const maxRetries = 3;

            while (retryCount < maxRetries) {
                try {
                    await this.debtorType.waitFor({ state: 'visible', timeout: 60000 });
                    logger.info('Debtor type radio button found');
                    break; // Success, exit loop
                } catch (error) {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        logger.error(`Failed to find debtor type after ${maxRetries} attempts`);

                        // Log current frame state
                        await this.logFramePresence();

                        // Log frame body for debugging
                        try {
                            const frameContent = await this.frame.locator('body').textContent();
                            logger.error(`Frame body content (first 500 chars): ${frameContent?.substring(0, 500)}`);
                        } catch (e) {
                            logger.error('Could not retrieve frame content');
                        }

                        throw error;
                    }

                    logger.warn(`Attempt ${retryCount} failed, retrying in 5 seconds...`);
                    await this.page.waitForTimeout(5000); // Wait 5s before retry
                }
            }

            // Click debtor type radio button
            await this.debtorType.click();

            logger.info('Manual assignment form opened successfully');
        } catch (error) {
            logger.error(`Failed to open manual assignment: ${error}`);

            // Log frame state for debugging
            await this.logFramePresence();

            // Take screenshot for debugging
            const screenshotPath = `POM-Tests/screenshots/manual-assignment-open-failure-${Date.now()}.png`;
            await this.takeScreenshot({ path: screenshotPath });
            logger.error(`Screenshot saved: ${screenshotPath}`);

            throw error;
        }
    }

    async fillDebtorDetails(details: AssignmentData['debtorDetails']) {
        logger.info('Filling debtor details');
        await this.businessName.fill(details.businessName);
        await this.address.fill(details.address);
        await this.province.selectOption(details.province);
        await this.zipCode.fill(details.zipCode);
        await this.city.fill(details.city);
        await this.srfNumber.pressSequentially(details.srfNumber, { delay: 100, timeout: 3000 });
        await expect(this.srfNumber).toHaveValue(details.srfNumber);
    }

    async fillAgreementDetails(details: AssignmentData['agreementDetails']) {
        logger.info('Filling agreement details');
        await this.agreementTab.click();
        await this.securityAgreement.selectOption(details.securityAgreement);
        await this.agreement.selectOption(details.agreement);
        await this.transit.fill(details.transit);
        await this.loanNumber.fill(details.loanNumber);
        await this.locationCode.fill(details.locationCode);
        await this.districtCode.fill(details.districtCode);
        await this.originalLoanBalance.fill(details.originalLoanBalance);
        await this.balanceOwing.fill(details.balanceOwing);
        await this.arrears.fill(details.arrears);
    }

    async submitAssignment() {
        logger.info('Submitting assignment');
        const [dialog] = await Promise.all([
            this.page.waitForEvent('dialog'),
            this.submitButton.click()
        ]);
        logger.info(`Alert message: ${dialog.message()}`);
        await dialog.accept();
    }

    async logoutUser() {
        logger.info('Logging out user');
        await this.logout.click();
    }

    async verifyTitleofThePage(expectedTitle: string) {
        let title: string = await this.page.title();
        logger.info(`Title of the page is: ${title}`);
        await expect(title).toEqual(expectedTitle);
    }

    async createAssignment(assignmentData: AssignmentData) {
        await this.openManualAssignment();
        await this.fillDebtorDetails(assignmentData.debtorDetails);
        await this.fillAgreementDetails(assignmentData.agreementDetails);
        await this.submitAssignment();
    }
}