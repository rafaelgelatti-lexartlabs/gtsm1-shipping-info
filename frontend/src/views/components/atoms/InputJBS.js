import { CCol } from '@coreui/react'
import PropTypes from 'prop-types'
import React from 'react'

const InputJBS = ({
  name,
  handleChange,
  placeholder = 'Escolher imagem',
  acceptInput = 'image/jpeg, image/jpg, image/png, application/pdf',
  multipleInputs = true,
  reference,
  className,
}) => {
  return (
    <CCol className={`d-flex ${className || ''}`}>
      <label
        htmlFor="arquivo"
        className="btn btn-primary"
        style={{
          borderRadius: 'var(--cui-btn-border-radius) 0 0 var(--cui-btn-border-radius)',
          height: '38px',
          width: '40% !important',
          flexShrink: '0',
          flexGrow: '0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {placeholder}
      </label>
      <label
        htmlFor="arquivo"
        style={{
          width: '70%',
          height: '38px',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          borderRadius: '0 var(--cui-border-radius) var(--cui-border-radius) 0',
        }}
        className="form-control input bd-1 p-2"
      >
        {name || 'Nenhum arquivo escolhido'}
      </label>
      <input
        ref={reference}
        accept={acceptInput}
        id="arquivo"
        lang="pt"
        name="arquivo"
        style={{ display: 'none' }}
        type="file"
        multiple={multipleInputs}
        onChange={handleChange}
      />
    </CCol>
  )
}

InputJBS.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  acceptInput: PropTypes.string,
  multipleInputs: PropTypes.bool,
  reference: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  className: PropTypes.string,
}

export default InputJBS
