import React, {
  useState, useRef, useMemo, useLayoutEffect
} from 'react';
import PropTypes from 'prop-types';
import useOutSideClick from './use_out_side_click';
import './index.scss';

const MultiselectDropdown = ({
  selectedValues = [],
  allSelectionsLabel,
  selectAllHandler,
  deselectHandler,
  list = [],
  changeHandler,
  fieldLabel,
  disabled,
  valueKey,
  labelKey,
  labels
}) => {
  const [isToggled, toggle] = useState(false);
  const [invisibleSelectedItems, setInvisibleItems] = useState([]);
  const [invisibleItemsToggled, setToggled] = useState(false);
  const parentNodeRef = useRef(null);
  const selectedItemsParent = useRef(null);
  const selectedLabels = useMemo(
    () => {
      let resStr = '';
      list.forEach((item) => {
        if (typeof item === 'string') {
          const isSelected = selectedValues.some(findItem => findItem === item);
          if (isSelected) {
            resStr += `${resStr === '' ? '' : ', '}${(labels || {})[item] || item}`;
          }
        } else {
          const isSelected = selectedValues.some(findItem => findItem === item[valueKey || 'value']);
          if (isSelected) {
            resStr += `${resStr === '' ? '' : ', '}${(item[labelKey || 'label'])}`;
          }
        }
      });
      return resStr;
    },
    [list, selectedValues, labelKey]
  );
  const selectedValuesStr = list.length === selectedValues.length ? allSelectionsLabel : selectedLabels;
  const selectedItemsArr = selectedValuesStr.split(',');
  const truncatedLabels = useMemo(
    () => {
      let str = '';
      selectedItemsArr.forEach(
        (item, index) => {
          const notVisible = invisibleSelectedItems.find(findStr => findStr === item);
          if (!notVisible) {
            str += `${index !== 0 ? ', ' : ''}${item}`;
          }
        }
      );
      return str;
    },
    [invisibleSelectedItems, selectedItemsArr]
  );
  useLayoutEffect(
    () => {
      const { offsetWidth: parentElWidth } = selectedItemsParent.current;
      const { children: childElements } = selectedItemsParent.current;
      const resArr = [];
      let usedSpace = 0;
      [...childElements].forEach(
        (item) => {
          const { offsetWidth: itemElWidth } = item;
          usedSpace += itemElWidth;
          if (usedSpace > parentElWidth) {
            resArr.push(item.innerText.replace(',', ''));
          }
        }
      );
      setInvisibleItems(resArr);
    },
    [selectedValuesStr]
  );
  useOutSideClick(parentNodeRef, () => toggle(false));
  return (
    <div className={`multiselect-dropdown ${isToggled ? 'opened' : ''}`} ref={parentNodeRef}>
      {
        fieldLabel && (<p className="field-label">{fieldLabel}</p>)
      }
      <div
        className={`visible-control ${disabled ? 'disabled' : ''}`}
        onClick={disabled ? () => null : () => toggle(!isToggled)}
        role="presentation"
        >
        <p
          title={selectedValuesStr}
          ref={selectedItemsParent}
          className="selected"
        >
          {
            selectedItemsArr.map((item, index) => (
              <span key={item}>{`${item}${selectedItemsArr.length - 1 !== index ? ',' : ''}`}</span>
            ))
          }
        </p>
        <p className="truncated-labels">{truncatedLabels}</p>
        {
          invisibleSelectedItems.length > 0 && (
            <div className="invisible-selected-items">
              <span
                role="presentation"
                onMouseEnter={() => setToggled(true)}
                onMouseOut={() => setToggled(false)}
              >
                {`+${invisibleSelectedItems.length}`}
              </span>
              {
                invisibleItemsToggled && !(isToggled && !disabled) && (
                  <div className="invisible-items">
                    {
                      invisibleSelectedItems.map(item => <span key={item}>{item}</span>)
                    }
                  </div>
                )
              }
            </div>
          )
        }
        <span className="icon-arrow-down-thick1" />
      </div>
      {
        isToggled && !disabled && (
          <div className="content-fall">
            {
              (deselectHandler || selectAllHandler) && (
                <div className="top-control">
                  {
                    deselectHandler && (
                      <button
                        disabled={selectedValues.length === 0}
                        onClick={deselectHandler}
                        className="deselect"
                        type="button"
                        >
                        <p>
                          {`Deselect All ${selectedValues.length !== 0 ? `(${selectedValues.length})` : ''}`}
                        </p>
                      </button>
                    )
                  }
                  {
                    selectAllHandler && (
                      <button
                        disabled={list.length === selectedValues.length}
                        onClick={selectAllHandler}
                        className="select"
                        type="button"
                        >
                        <p>Select All</p>
                      </button>
                    )
                  }
                </div>
              )
            }
            <div className="select-options">
              {
                list.map((item) => {
                  const isItemIsString = typeof item === 'string';
                  const isSelected = selectedValues.some(findKey => findKey === (isItemIsString ? item : item[valueKey || 'value']));
                  const value = isItemIsString ? item : item[valueKey || 'value'];
                  return (
                    <div
                      className={`each-field ${isSelected ? 'selected' : ''}`}
                      key={isItemIsString ? item : item[valueKey || 'value']}
                      onClick={() => changeHandler(value)}
                      role="presentation"
                      >
                      <p className="label">
                        {
                          isItemIsString ? ((labels || {})[item] || item) : item[labelKey || 'label']
                        }
                      </p>
                      <span className={`checkbox ${isSelected ? 'icon-thin-check' : ''}`} />
                    </div>
                  );
                })
              }
            </div>
          </div>
        )
      }
    </div>
  );
};

MultiselectDropdown.propTypes = {
  allSelectionsLabel: PropTypes.string,
  selectAllHandler: PropTypes.func,
  deselectHandler: PropTypes.func,
  selectedValues: PropTypes.array,
  changeHandler: PropTypes.func,
  fieldLabel: PropTypes.string,
  valueKey: PropTypes.string,
  labelKey: PropTypes.string,
  labels: PropTypes.object,
  disabled: PropTypes.bool,
  list: PropTypes.array
};

export default MultiselectDropdown;
