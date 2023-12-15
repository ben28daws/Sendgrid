import { LightningElement, track, wire } from 'lwc';
import getRecords from '@salesforce/apex/getdata.getRecords';
import sendEmail from '@salesforce/apex/SendGridEmailAuthorization.sendEmail';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class SendGridEmailAuthorization extends LightningElement {
    @track columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Email', fieldName: 'Email' }
    ];
    @track records;
    @track selectedRecordIds = [];
    @track objectApiName;
    @track objectOptions = [
        { label: 'Lead', value: 'Lead' },
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' }
    ];

    @wire(getRecords, { objectType: '$objectApiName' })
    wiredRecords({ data, error }) {
        if (data) {
            this.records = data;
        } else if (error) {
            console.error('Error fetching records:', error);
        }
    }

    handleSendEmail() {
        if (this.selectedRecordIds.length > 0) {
            sendEmail({ selectedRecordIds: this.selectedRecordIds, objectType: this.objectApiName })
                .then((result) => {
                    this.showSuccessToast(result.message);
                    const closeActionEvent = new CloseActionScreenEvent();
                    this.dispatchEvent(closeActionEvent);
                })
                .catch((error) => {
                    console.error('Error sending email:', error);
                    this.showErrorToast('Error sending email', error.body.message);
                });
        } else {
            this.showErrorToast('No Records Selected', 'Please select records before sending emails.');
        }
    }

    handleRecordSelection(event) {
        const selectedRows = event.detail.selectedRows;
        this.selectedRecordIds = selectedRows.map((row) => row.Id);
    }

    handleObjectChange(event) {
        this.objectApiName = event.target.value;
    }

    showSuccessToast(message) {
        const event = new ShowToastEvent({
            title: 'Success',
            message: message,
            variant: 'success',
        });
        this.dispatchEvent(event);
    }

    showErrorToast(title, message) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: 'error',
        });
        this.dispatchEvent(event);
    }
}