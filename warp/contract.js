const functions = { balance, transfer, visits, visit, price, setPrice }

export function handle(state, action) {
  if (Object.keys(functions).includes(action.input.function)) {
    return functions[action.input.function](state, action)
  }
  return ContractError('function not defined!')
}

function price(state, action) {
  return { result: state.price }
}

function setPrice(state, action) {
  const { input, caller } = action

  if (state.balances.includes(caller) && state.balances[caller] === 1) {
    ContractAssert(input.price, 'Price is required!')
    ContractAssert(input.sellType, 'SellType required either buynow or auction')
    ContractAssert(['buynow', 'auction'].includes(input.sellType), 'selltype must be buynow or auction')
    if (input.price) {
      state.price = input.price
      state.sellType = input.sellType
    }
    return { state }
  }
  throw ContractError('Only current owner can change price!')
}

function visits(state, action) {
  return { result: state.visits.length }
}

function visit(state, action) {
  const { caller } = action

  if (!state.visits.includes(caller)) {
    state.visits = [...state.visits, caller]
  }
  return { state }
}

function balance(state, action) {
  const { input, caller } = action
  let target = input.target ? input.target : caller;
  const { ticker, balances } = state;
  ContractAssert(
    typeof target === 'string', 'Must specify target to retrieve balance for'
  )
  return {
    result: {
      target,
      ticker,
      balance: target in balances ? balances[target] : 0
    }
  }
}

function transfer(state, action) {
  const { input, caller } = action
  const { target, qty } = input
  ContractAssert(target, 'No target specified')
  ContractAssert(caller !== target, 'Invalid Token Transfer. ')
  ContractAssert(qty, 'No quantity specified')
  const { balances } = state
  ContractAssert(
    caller in balances && balances[caller] >= qty,
    'Caller has insufficient funds'
  )
  balances[caller] -= qty
  if (!(target in balances)) {
    balances[target] = 0
  }
  balances[target] += qty
  state.balances = balances
  return { state }
}

function purchaseRequest(state, action) {
  const tx = SmartWeave.transaction
  const { input, caller } = action
  const { bids } = state


}

