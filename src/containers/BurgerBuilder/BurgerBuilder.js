import React ,{Component} from 'react';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-order';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';




const INGREDIENT_PRICE ={
     salad : 0.5,
     cheese : 0.4,
     meat : 1.3,
     bacon : 0.7
}



class BurgerBuilder extends Component {
state ={

    ingredients :null,
        salad:0,
        bacon :0 ,
        cheese : 0,
        meat :0,
    totalPrice : 4,
    purchasable : false,
    purchasing: false,
    loading : false,
    error : false
}

componentDidMount () {

    axios.get('https://react-burger-builder-c7dc7.firebaseio.com/ingredients.json')
    .then( response => {
        this.setState({ingredients : response.data});
    }).catch( error => {
        this.setState({ error : true});
    });
}

 updatePurchaseState (ingredients) {
//    const ingredients = {
//        ...this.state.ingredients
//    };
   const sum = Object.keys(ingredients).map( igkey => {
       return ingredients[igkey];
    }).reduce((sum , el) => {
        return sum + el;
    } , 0);
    this.setState({purchasable : sum > 0})
}
addIngredientHandler =(type) => {
    const oldCount = this.state.ingredients[type];
    const updatedCount = oldCount + 1;
    const updatedIngredients = {
               ...this.state.ingredients
    };

    updatedIngredients[type] =updatedCount;
    const priceAddition = INGREDIENT_PRICE[type];
    const oldPrice=    this.state.totalPrice;
    const newPrice = oldPrice+ priceAddition;
    this.setState({totalPrice : newPrice , ingredients : updatedIngredients});
    this.updatePurchaseState(updatedIngredients);

}

removeIngredientHandler =(type) => {
    const oldCount = this.state.ingredients[type];
    if(oldCount <= 0){
     return;
    }
    const updatedCount = oldCount - 1;
    const updatedIngredients = {
               ...this.state.ingredients
    };

    updatedIngredients[type] =updatedCount;
    const priceDeduction = INGREDIENT_PRICE[type];
    const oldPrice=    this.state.totalPrice;
    const newPrice = oldPrice - priceDeduction;
    this.setState({totalPrice : newPrice , ingredients : updatedIngredients});
    this.updatePurchaseState(updatedIngredients);
}

purchaseHandler = () => {
this.setState({ purchasing : true});

}

purchaseCancelHandler = () => {
    this.setState({ purchasing : false});
    
    }

    purchaseContinueHandler = () => {
    const queryParams =[];
    //let price = Number.parseFloat(this.state.totalPrice).toFixed(2);
    for(let i in this.state.ingredients) {
      queryParams.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]))
    }
    queryParams.push('price=' + this.state.totalPrice.toFixed(2));
    const queryString =queryParams.join('&');

          this.props.history.push({
              pathname : '/checkout',
              search : '?' + queryString
          });
        
        }

render(){

    const disabledInfo ={
        ...this.state.ingredients
    };

    for(let key in disabledInfo){
        disabledInfo[key] = disabledInfo[key] <= 0

    }
    let orderSummary= null;
  
  let burger = this.state.error ? <p>Ingredients can't be loaded!</p> : <Spinner/>;

  if(this.state.ingredients){
    burger =(

        <Auxiliary>
        <Burger ingredients={this.state.ingredients}/>
        <BuildControls
        ingredientAdded={this.addIngredientHandler}
        ingredientremove={this.removeIngredientHandler}
        disabled={disabledInfo}
        price={this.state.totalPrice}
        purchasable={this.state.purchasable}
        ordered={this.purchaseHandler}/>
    </Auxiliary>
    );

    orderSummary= <OrderSummary 
    ingredients={this.state.ingredients}
    purchaseCancelled={this.purchaseCancelHandler}
    purchaseContinued={this.purchaseContinueHandler}
    price={this.state.totalPrice}
    />;

    
  }
  
  if(this.state.loading){
    orderSummary = <Spinner/>
 }

      return(
          <Auxiliary>
              <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                 {orderSummary}
              </Modal>
               {burger}
          </Auxiliary>
      );

}

}
export default withErrorHandler(BurgerBuilder , axios);