import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { closePopup } from '../../../lib/popup';

import { useModal } from '../../../hooks';
import AddTextFileModal from './AddTextFileModal';

import styles from './AddAttachmentZone.module.css';

const AddAttachmentZone = React.memo(({ children, onCreate }) => {
  const [t] = useTranslation();
  const [modal, openModal, handleModalClose] = useModal();

  const submit = useCallback(
    (file) => {
      onCreate({
        file,
      });
    },
    [onCreate],
  );

  const handleDropAccepted = useCallback(
    (files) => {
      submit(files[0]);
    },
    [submit],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDropAccepted: handleDropAccepted,
  });

  const handleFileCreate = useCallback(
    (file) => {
      submit(file);
    },
    [submit],
  );

  useEffect(() => {
    const handlePaste = (event) => {
      const item = event.clipboardData && event.clipboardData.items[0];

      if (!item) {
        return;
      }

      if (item.kind === 'file') {
        submit(item.getAsFile());
        return;
      }

      if (
        ['input', 'textarea'].includes(event.target.tagName.toLowerCase()) &&
        event.target === document.activeElement
      ) {
        return;
      }

      closePopup();
      event.preventDefault();

      item.getAsString((content) => {
        openModal({
          content,
        });
      });
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [openModal, submit]);

  return (
    <>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <div {...getRootProps()}>
        {isDragActive && <div className={styles.dropzone}>{t('common.dropFileToUpload')}</div>}
        {children}
      </div>
      {modal && (
        <AddTextFileModal
          content={modal.content}
          onCreate={handleFileCreate}
          onClose={handleModalClose}
        />
      )}
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <input {...getInputProps()} />
    </>
  );
});

AddAttachmentZone.propTypes = {
  children: PropTypes.element.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default AddAttachmentZone;
