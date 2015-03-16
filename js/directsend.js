(function(window, document, $, undefined) {
    'use strict';

    var DirectSend = function() {
        var _this = this;

        $(function() {
            _this.$els = {
                fileInput: $('#btn-file :file'),
                errorModal: $('#error-modal'),
                sendFileModal: $('#send-file-modal'),
                successModal: $('#success-modal'),
                transferUrl: $('#transfer-url')
            };

            _this.$els.transferUrl.on('click', function() {
                this.selectionStart = 0;
                this.selectionEnd = this.value.length;
            });

            _this.$els.fileInput.on('change', function() {
                _this.sendFile();
            });
        });
    };

    DirectSend.prototype.errorModal = function(action) {
        this.$els.errorModal.modal(action);
    };

    DirectSend.prototype.sendFileModal = function(action, url) {
        url = url || '';

        this.$els.transferUrl.val(url);
        this.$els.sendFileModal.modal(action);
    };

    DirectSend.prototype.successModal = function(action) {
        this.$els.successModal.modal(action);
    };

    DirectSend.prototype.showErrorModal = function() {
        this.sendFileModal('hide');
        this.successModal('hide');

        this.errorModal('show');
    };

    DirectSend.prototype.showSendFileModal = function(url) {
        this.successModal('hide');
        this.errorModal('hide');

        this.sendFileModal('show', url);
    };

    DirectSend.prototype.showSuccessModal = function() {
        this.errorModal('hide');
        this.sendFileModal('hide');

        this.successModal('show');
    };

    DirectSend.prototype.resetFileInput = function() {
        var _this = this;

        this.$els.fileInput.off('change');

        this.$els.fileInput.wrap('<form>').closest('form').get(0).reset();
        this.$els.fileInput.unwrap();

        this.$els.fileInput.on('change', function() {
            _this.sendFile();
        });
    };

    DirectSend.prototype.generateFormData = function() {
        var formData, file;

        formData = new FormData();
        file = this.$els.fileInput.get(0).files[0];

        formData.append('file', file);

        this.resetFileInput();

        return formData;
    };

    DirectSend.prototype.createTransfer = function(callback) {
        $.ajax({
            url: 'https://api.directsend.io/transfer',
            type: 'POST',
            cache: false,
            dataType: 'json',
            error: function() {
                callback(true);
            },
            success: function(data) {
                var url = 'https://' + data.hostname + '/transfer/' + data.id;

                callback(false, url);
            }
        });
    };

    DirectSend.prototype.startTransfer = function(url, callback) {
        var data = this.generateFormData();

        $.ajax({
            url: url,
            type: 'POST',
            cache: false,
            data: data,
            contentType: false,
            processData: false,
            error: function() {
                callback(true);
            },
            success: function() {
                callback(false);
            }
        });
    };

    DirectSend.prototype.sendFile = function() {
        var _this = this;

        this.createTransfer(function(err, url) {
            if (err) {
                return _this.showErrorModal();
            }

            _this.startTransfer(url, function(err) {
                if (err) {
                    return _this.showErrorModal();
                }

                _this.showSuccessModal();
            });

            _this.showSendFileModal(url);
        });
    };

    window.DirectSend = new DirectSend();

}(window, document, jQuery));
