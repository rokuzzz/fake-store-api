import { CartItem } from './../models/CartItem';
import { CustomError } from "../models/CustomError";
import Cart from "../models/Cart";

const getCart = async () => {
  return await Cart.find();
};

const getCartById = async (cartItemId: string) => {
  const foundItem = await Cart.findById(cartItemId).populate("productId");
  if (!foundItem) {
    throw new CustomError(404, "Item does not exist in cart");
  }
  return foundItem;
};

const updateProductInCart = async (cartItem: CartItem, userId: string) => {
  const { quantity, productId } = cartItem;
  const existedCart = await Cart.findOne({ user: userId });
  if (existedCart) {
    const { products } = existedCart;
    const listOfProducts: CartItem[] = products;
    //Check if product has already existed in cart
    const existedProduct = listOfProducts.find(
      (product: CartItem | undefined) => {
        return product?.productId.toString() === productId.toString();
      }
    );
    if (existedProduct) {
      // if a matching product is found, update the quantity of that product
      existedProduct.quantity = quantity;
      const modifiedProductsList = listOfProducts.map(
        (product: CartItem | undefined) => {
          if (product?.productId.toString() === productId.toString()) {
            return existedProduct;
          } else {
            return product;
          }
        }
      );
      return await Cart.findByIdAndUpdate(
        existedCart._id,
        {
          $set: { products: modifiedProductsList },
          user: userId,
        },
        { new: true }
      )
        .populate({ path: "products.productId", select: "name _id" })
        .populate({ path: "user", select: "email _id" });
    } else {
      throw new CustomError(404, "Product does not exist in cart");
    }
  } else {
    throw new CustomError(
      404,
      "Cart does not exist. Create a new cart before update product in cart"
    );
  }
};
const deleteCart = async (cartId: string) => {
  const existedCart = await Cart.findById(cartId);
  if (existedCart) {
    return await Cart.findByIdAndDelete(existedCart._id);
  } else {
    throw new CustomError(404, "Cart does not exist");
  }
};

const addNewProductToCart = async (cartItem: CartItem, userId: string) => {
  const { productId, quantity } = cartItem;
  //Check if cart matches any cart in the DB
  const existedCart = await Cart.findOne({ user: userId });
  if (existedCart) {
    const { products } = existedCart;
    const listOfProducts: CartItem[] = products;
    //Check if product has already existed in cart
    const existedProduct = listOfProducts.find(
      (product: CartItem | undefined) => {
        return product?.productId.toString() === productId.toString();
      }
    );
    if (existedProduct) {
      // if a matching product is found, update the quantity of that product
      existedProduct.quantity = quantity;
      const modifiedProductsList = listOfProducts.map(
        (product: CartItem | undefined) => {
          if (product?.productId.toString() === productId.toString()) {
            return existedProduct;
          } else {
            return product;
          }
        }
      );
      return await Cart.findByIdAndUpdate(
        existedCart._id,
        {
          $set: { products: modifiedProductsList },
          user: userId,
        },
        { new: true }
      )
        .populate({ path: "products.productId", select: "name _id" })
        .populate({ path: "user", select: "email _id" });
    } else {
      // else just push new product to products array
      return await Cart.findByIdAndUpdate(
        existedCart._id,
        {
          // $push: { products: cartItem },
          user: userId,
        },
        { new: true }
      )
        .populate({ path: "products.productId", select: "name _id" })
        .populate({ path: "user", select: "email _id" });
    }
  }
  // otherwise just create a new cart
  const newCart = new Cart({
    user: userId,
    products: cartItem,
  });
  await newCart.save();
  return Cart.findById(newCart._id)
    .populate({ path: "products.productId", select: "name _id" })
    .populate({ path: "user", select: "email _id" });
};

export default {
  getCart,
  getCartById,
  addNewProductToCart,
  updateProductInCart,
  deleteCart,
};