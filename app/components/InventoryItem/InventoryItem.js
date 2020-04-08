import React, { PureComponent} from 'react';
import style from './style.scss';

class InventoryItem extends PureComponent {
    constructor(props) {
        super(props)
    }

    click = () => {
        const {click, item, selecting} = this.props;
        click(item, selecting);
    };

    render() {
        const {item, size, inBet, staticItem} = this.props;
        const style = {
            background: "url('" + item.icon + "') center",
            backgroundSize: "cover",
            width: `${size}px`,
            height: `${size}px`,
            minWidth: `${size}px`,
            minHeight: `${size}px`
        }
        return (
            <div
              onClick={staticItem ? null : this.click}
              className={`inventory_item ${item.quality.toLowerCase()} ${inBet ? 'inBet' : ''}`}
              style={style}
              name={item.hash_name}>
                {
                    this.props.selected &&
                        <div className="inventory_item_select-wrapper">
                            <p className="inventory_item_label" style={{fontSize: `${size/2}px`, color: `#${item.color}`}}>✓</p>
                        </div>
                }
                <div className="inventory_item_label-wrapper">
                    <p className="inventory_item_label" style={{fontSize: `${(size/5)/(item.name.length/75 + 1)}px`, color: `#${item.color}`}}>{item.name}</p>
                    <p className="inventory_item_label" style={{fontSize: `${(size/5)/(item.name.length/75 + 1)}px`, color: "white"}}>{`$${item.price}`}</p>
                </div>
            </div>
        )
    }
}

InventoryItem.defaultProps = {
    inBet: false
};

export default InventoryItem;