/**
 *  SudoSOS back-end API service.
 *  Copyright (C) 2026 Study association GEWIS
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *  @license
 */

import { DataSource, IsNull, Not } from 'typeorm';
import express, { Application } from 'express';
import { SwaggerSpecification } from 'swagger-model-validator';
import bodyParser from 'body-parser';
import chai, { expect } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import Database from '../../../src/database/database';
import Swagger from '../../../src/start/swagger';
import ProductService, { ProductFilterParameters } from '../../../src/service/product-service';
import Product from '../../../src/entity/product/product';
import {
  ProductResponse,
} from '../../../src/controller/response/product-response';
import ProductRevision from '../../../src/entity/product/product-revision';
import Container from '../../../src/entity/container/container';
import ContainerRevision from '../../../src/entity/container/container-revision';
import CreateProductParams, { UpdateProductParams } from '../../../src/controller/request/product-request';
import PointOfSale from '../../../src/entity/point-of-sale/point-of-sale';
import PointOfSaleRevision from '../../../src/entity/point-of-sale/point-of-sale-revision';
import ProductImage from '../../../src/entity/file/product-image';
import User from '../../../src/entity/user/user';
import { CreateContainerParams } from '../../../src/controller/request/container-request';
import ContainerService from '../../../src/service/container-service';
import { CreatePointOfSaleParams } from '../../../src/controller/request/point-of-sale-request';
import PointOfSaleService from '../../../src/service/point-of-sale-service';
import OrganMembership from '../../../src/entity/organ/organ-membership';
import AuthenticationService from '../../../src/service/authentication-service';
import { truncateAllTables } from '../../helpers/database-helpers';
import { finishTestDB } from '../../helpers/test-helpers';
import sinon from 'sinon';
import { ContainerSeeder, PointOfSaleSeeder, ProductSeeder, UserSeeder } from '../../seed';

chai.use(deepEqualInAnyOrder);

/**
 * Test if the price excluding VAT in the response is correct
 * @param response
 */
function correctPriceExclVat(response: ProductResponse) {
  const priceInclVat = Math.round(
    response.priceExclVat.amount * (1 + (response.vat.percentage / 100)),
  );
  // Rounding issues are a thing, e.g. with price including 21% VAT of 78
  const diff = Math.abs(priceInclVat - response.priceInclVat.amount);
  expect(diff).to.be.at.most(1);
}

/**
 * Test if all the product responses are part of the product set array.
 * @param response
 * @param superset
 */
function returnsAll(response: ProductResponse[], superset: Product[]) {
  expect(response).to.not.be.empty;
  expect(response.length).to.equal(superset.length);
  const temp = superset.map((prod) => ({
    id: prod.id, ownerid: prod.owner.id, image: prod.image != null ? prod.image.downloadName : null,
  }));
  expect(response.map((prod) => ({ id: prod.id, ownerid: prod.owner.id, image: prod.image })))
    .to.deep.equalInAnyOrder(temp);
}

interface ProductWithRevision {
  product: Product,
  revision: number
}

/**
 * Test if all the product responses are part of the product set array.
 * @param response
 * @param superset
 */
function returnsAllRevisions(response: ProductResponse[], superset: ProductWithRevision[]) {
  expect(response).to.not.be.empty;
  expect(response.map((prod) => ({ id: prod.id, revision: prod.revision, ownerid: prod.owner.id })))
    .to.deep.equalInAnyOrder(superset.map((prod) => (
      ({ id: prod.product.id, revision: prod.revision, ownerid: prod.product.owner.id }))));
}

function productRevisionToProductWithRevision(product: ProductRevision): ProductWithRevision {
  return {
    product: product.product,
    revision: product.revision,
  };
}

function validateProductProperties(response: ProductResponse, productParams: CreateProductParams | UpdateProductParams) {
  Object.keys(productParams).forEach((key: keyof CreateProductParams) => {
    if (key === 'priceInclVat') {
      expect((productParams[key] as any).amount).to.be.equal((response.priceInclVat.amount));
    } else if (key === 'category') {
      expect((productParams[key] as any)).to.be.equal((response.category.id));
    } else if (key === 'vat') {
      expect((productParams[key] as any)).to.be.equal((response.vat.id));
    } else if (key === 'ownerId') {
      if ((productParams as any).ownerId !== undefined) {
        expect((productParams as any).ownerId).to.be.equal((response.owner.id));
      }
    } else {
      expect((productParams[key] as any)).to.be.equal((response[key]));
    }
  });
}

describe('ProductService', async (): Promise<void> => {
  let ctx: {
    connection: DataSource,
    app: Application,
    specification: SwaggerSpecification,
    users: User[],
    products: Product[],
    deletedProducts: Product[],
    productImages: ProductImage[],
    productRevisions: ProductRevision[],
    containers: Container[],
    deletedContainers: Container[],
    containerRevisions: ContainerRevision[],
    pointsOfSale: PointOfSale[],
    deletedPointsOfSale: PointOfSale[],
    pointOfSaleRevisions: PointOfSaleRevision[],
  };

  beforeAll(async () => {
    const connection = await Database.initialize();
    await truncateAllTables(connection);

    const users = await new UserSeeder().seed();

    const {
      products,
      productImages,
      productRevisions,
    } = await new ProductSeeder().seed(users);
    const {
      containers,
      containerRevisions,
    } = await new ContainerSeeder().seed(users, productRevisions);
    const {
      pointsOfSale,
      pointOfSaleRevisions,
    } = await new PointOfSaleSeeder().seed(users, containerRevisions);

    // start app
    const app = express();
    const specification = await Swagger.initialize(app);
    app.use(bodyParser.json());

    // initialize context
    ctx = {
      connection,
      app,
      specification,
      users,
      products: products.filter((p) => p.deletedAt == null),
      deletedProducts: products.filter((p) => p.deletedAt != null),
      productImages,
      productRevisions,
      containers: containers.filter((c) => c.deletedAt == null),
      deletedContainers: containers.filter((c) => c.deletedAt != null),
      containerRevisions,
      pointsOfSale: pointsOfSale.filter((p) => p.deletedAt == null),
      deletedPointsOfSale: pointsOfSale.filter((p) => p.deletedAt != null),
      pointOfSaleRevisions,
    };
  });

  // close database connection
  afterAll(async () => {
    await finishTestDB(ctx.connection);
  });

  describe('getProducts function', () => {
    it('should return all products with no input specification', async () => {
      const [revisions, count] = await ProductService.getProducts({ returnContainers: true });
      const records = revisions.map((r) => ProductService.revisionToResponse(r));

      const products = ctx.products.filter((prod) => prod.currentRevision !== null);

      returnsAll(records, products);
      for (let i = 0; i < records.length; i += 1) {
        const p = records[i];
        if (p.vat !== undefined || p.priceExclVat !== undefined) {
          correctPriceExclVat(p);
        } else {
          // eslint-disable-next-line no-await-in-loop
          const productRevision = await ProductRevision.findOne({
            where: { product: { id: p.id }, revision: p.revision },
            relations: {
              vat: true,
            },
          });
          const vatGroup = productRevision!.vat;
          expect(vatGroup.hidden).to.be.true;
        }
      }

      expect(count).to.equal(products.length);
    });
    it('should return product with the ownerId specified', async () => {
      const owner = ctx.products[0].owner.id;
      const params: ProductFilterParameters = { ownerId: ctx.products[0].owner.id };
      const [revisions] = await ProductService.getProducts(params);
      const records = revisions.map((r) => ProductService.revisionToResponse(r));

      const products = ctx.products.filter((prod) => (
        prod.currentRevision !== null && prod.owner.id === owner));

      returnsAll(records, products);
    });
    it('should return product with the revision specified', async () => {
      const productId = ctx.products[0].id;
      const productRevision = ctx.products[0].currentRevision - 1;
      expect(productRevision).to.be.greaterThan(0);

      const params: ProductFilterParameters = { productId, productRevision };
      const [revisions] = await ProductService.getProducts(params);
      const records = revisions.map((r) => ProductService.revisionToResponse(r));

      const product: ProductWithRevision[] = [productRevisionToProductWithRevision(
        ctx.productRevisions.find((prod) => (
          (prod.revision === productRevision && prod.product.id === productId))),
      )];

      returnsAllRevisions(records, product);
    });
    it('should return a single product if productId is specified', async () => {
      const params: ProductFilterParameters = { productId: ctx.products[0].id };
      const [revisions] = await ProductService.getProducts(params);
      const records = revisions.map((r) => ProductService.revisionToResponse(r));

      returnsAll(records, [ctx.products[0]]);
    });
    it('should return no products if the userId and productId dont match', async () => {
      const params: ProductFilterParameters = {
        ownerId: ctx.products[0].owner.id + 1,
        productId: ctx.products[0].id,
      };
      const [revisions] = await ProductService.getProducts(params);

      expect(revisions).to.be.empty;
    });
    it('should return the products belonging to a VAT group', async () => {
      const params: ProductFilterParameters = {
        vatGroupId: 1,
      };
      const [revisions] = await ProductService.getProducts(params);
      const records = revisions.map((r) => ProductService.revisionToResponse(r));

      const products = ctx.productRevisions
        .filter((rev) => rev.vat.id === params.vatGroupId)
        .filter((rev) => rev.revision === rev.product.currentRevision);

      returnsAllRevisions(records, products);
    });
    it('should adhere to pagination', async () => {
      const take = 5;
      const skip = 3;

      const [revisions, count] = await ProductService
        .getProducts({  }, { take, skip });

      expect(count).to.equal(ctx.products.length);
      expect(revisions.length).to.be.at.most(take);
    });
    it('should return all products involving a single user and its memberAuthenticator users', async () => {
      const usersOwningAProd = [...new Set(ctx.products.map((prod) => prod.owner))];
      const owner = usersOwningAProd[0];

      // Sanity check
      const memberAuthenticators = await OrganMembership.find({
        where: { user: { id: owner.id } },
      });
      expect(memberAuthenticators.length).to.equal(0);

      let [revisions] = await ProductService.getProducts({}, {}, owner);
      let records = revisions.map((r) => ProductService.revisionToResponse(r));
      const originalLength = records.length;
      records.forEach((prod) => {
        expect(prod.owner.id).to.equal(owner.id);
      });

      await new AuthenticationService().setMemberAuthenticator([owner], usersOwningAProd[1]);

      const ownerIds = [owner, usersOwningAProd[1]].map((o) => o.id);
      [revisions] = await ProductService.getProducts({}, {}, owner);
      records = revisions.map((r) => ProductService.revisionToResponse(r));
      expect(records.length).to.be.greaterThan(originalLength);
      records.forEach((prod) => {
        expect(ownerIds).to.include(prod.owner.id);
      });

      // Cleanup
      await OrganMembership.delete({ user: { id: owner.id } });
    });
    it('should return products which are featured', async () => {
      const params: ProductFilterParameters = {
        featured: true,
      };
      const [revisions] = await ProductService.getProducts(params);
      const records = revisions.map((r) => ProductService.revisionToResponse(r));

      const products = ctx.productRevisions
        .filter((rev) => {
          const product = ctx.products.filter((prod) => prod.id === rev.productId)[0];
          return rev.product.deletedAt == null && rev.featured && product.currentRevision === rev.revision && product.id === rev.productId;
        });

      returnsAllRevisions(records, products);
    });
    it('should return products which are preferred', async () => {
      const params: ProductFilterParameters = {
        preferred: true,
      };
      const [revisions] = await ProductService.getProducts(params);
      const records = revisions.map((r) => ProductService.revisionToResponse(r));

      const products = ctx.productRevisions
        .filter((rev) => {
          const product = ctx.products.filter((prod) => prod.id === rev.productId)[0];
          return rev.product.deletedAt == null && rev.preferred && product.currentRevision === rev.revision && product.id === rev.productId;
        });

      returnsAllRevisions(records, products);
    });
    it('should return products which are shown on the price list', async () => {
      const params: ProductFilterParameters = {
        priceList: true,
      };
      const [revisions] = await ProductService.getProducts(params);
      const records = revisions.map((r) => ProductService.revisionToResponse(r));

      const products = ctx.productRevisions
        .filter((rev) => {
          const product = ctx.products.filter((prod) => prod.id === rev.productId)[0];
          return rev.product.deletedAt == null && rev.priceList && product.currentRevision === rev.revision && product.id === rev.productId;
        });

      returnsAllRevisions(records, products);
    });
  });

  describe('createProduct function', () => {
    it('should create the product', async () => {
      const creation: CreateProductParams = {
        alcoholPercentage: 0,
        category: 1,
        vat: 1,
        name: 'New Product Name',
        featured: true,
        preferred: false,
        priceList: true,
        ownerId: (await User.findOne({ where: { deleted: false } })).id,
        priceInclVat: {
          amount: 50,
          currency: 'EUR',
          precision: 2,
        },
      };

      const revision = await ProductService.createProduct(creation);
      const response = ProductService.revisionToResponse(revision);
      validateProductProperties(response, creation);
      const entity = await Product.findOne({ where: { id: response.id } });
      expect(entity.currentRevision).to.eq(1);

      // Cleanup
      await ProductRevision.delete({ productId: response.id });
      await Product.delete({ id: response.id });
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const owner = ctx.users[0];
      const product = await Product.save({
        owner,
      });
      expect(product.currentRevision).to.be.null;

      const update: UpdateProductParams = {
        alcoholPercentage: 10,
        category: 1,
        vat: 1,
        id: product.id,
        name: 'A product update',
        featured: true,
        preferred: false,
        priceList: true,
        priceInclVat: {
          amount: 51,
          precision: 2,
          currency: 'EUR',
        },
      };
      let revision = await ProductService.updateProduct(update);
      let response = ProductService.revisionToResponse(revision);
      validateProductProperties(response, update);

      const update2: UpdateProductParams = {
        ...update,
        alcoholPercentage: 20,
      };
      revision = await ProductService.updateProduct(update2);
      response = ProductService.revisionToResponse(revision);
      validateProductProperties(response, update2);

      // Cleanup
      await ProductRevision.delete({ productId: product.id });
      await Product.delete({ id: product.id });
    });
    it('should propagate to containers when a second update bumps the revision before the first propagates', async () => {
      const containerRevisions = await ContainerRevision.find({
        relations: { products: true },
        withDeleted: true,
      });
      const isCurrentProduct = (p: ProductRevision) => p.product.deletedAt == null
        && p.revision === p.product.currentRevision;
      const containerRevision = containerRevisions.find((c) => c.container.deletedAt == null
        && c.revision === c.container.currentRevision
        && c.products.some(isCurrentProduct));
      expect(containerRevision).to.not.be.undefined;
      const product = containerRevision.products.find(isCurrentProduct);
      const oldContainerRevisionNumber = containerRevision.revision;

      const productWithRelations = await ProductRevision.findOne({
        where: { productId: product.productId, revision: product.revision },
        relations: { vat: true, category: true },
      });
      const update = (name: string): UpdateProductParams => ({
        id: product.productId,
        name,
        alcoholPercentage: Number(productWithRelations.alcoholPercentage),
        category: productWithRelations.category.id,
        vat: productWithRelations.vat.id,
        featured: productWithRelations.featured,
        preferred: productWithRelations.preferred,
        priceList: productWithRelations.priceList,
        priceInclVat: {
          amount: productWithRelations.priceInclVat.getAmount(),
          currency: 'EUR',
          precision: 2,
        },
      });

      const original = ProductService.propagateProductUpdate.bind(ProductService);
      let releaseA: () => void;
      const gate = new Promise<void>((r) => { releaseA = r; });
      let signalReached: () => void;
      const reached = new Promise<void>((r) => { signalReached = r; });

      // Pause the first propagation until the second update has fully completed.
      const stub = sinon.stub(ProductService, 'propagateProductUpdate');
      stub.callThrough();
      stub.onFirstCall().callsFake(async (id: number) => {
        signalReached();
        await gate;
        return original(id);
      });

      try {
        const updateA = ProductService.updateProduct(update('Interleaved Product A'));
        await reached;
        await ProductService.updateProduct(update('Interleaved Product B'));
        releaseA();
        await updateA;
      } finally {
        stub.restore();
      }

      const base = await Product.findOne({ where: { id: product.productId } });
      const containerBase = await Container.findOne({ where: { id: containerRevision.containerId } });
      const currentContainer = await ContainerRevision.findOne({
        where: { containerId: containerRevision.containerId, revision: containerBase.currentRevision },
        relations: { products: true },
      });
      const productInContainer = currentContainer.products.find((p) => p.productId === product.productId);
      expect(productInContainer.revision).to.eq(base.currentRevision);
      expect(productInContainer.name).to.eq('Interleaved Product B');
      // We update here by only 1 revision as we immediately get both product updates
      expect(currentContainer.revision).to.eq(oldContainerRevisionNumber + 1);
      expect(currentContainer.products.map((p) => p.productId))
        .to.deep.equalInAnyOrder(containerRevision.products
          .filter((p) => p.product.deletedAt == null)
          .map((p) => p.productId));
    });
  });

  describe('propagateProductUpdate function', () => {
    it('should propagate the update to all containers', async () => {
      const ownerId = (await User.findOne({ where: { deleted: false } })).id;
      const createProduct: CreateProductParams = {
        alcoholPercentage: 0,
        category: 1,
        vat: 1,
        name: 'New Product Name',
        ownerId,
        featured: true,
        preferred: false,
        priceList: true,
        priceInclVat: {
          amount: 50,
          currency: 'EUR',
          precision: 2,
        },
      };

      const productRevision = await ProductService.createProduct(createProduct);
      const product = ProductService.revisionToResponse(productRevision);

      const createContainer: CreateContainerParams = {
        name: 'Container Name',
        ownerId,
        products: [product.id],
        public: true,
      };

      const containerRev = await ContainerService.createContainer(createContainer);

      const update: UpdateProductParams = {
        id: product.id,
        alcoholPercentage: 1,
        category: 2,
        vat: 1,
        name: 'New Product Name 2',
        featured: true,
        preferred: false,
        priceList: true,
        priceInclVat: {
          amount: 55,
          currency: 'EUR',
          precision: 2,
        },
      };

      const updatedRevision = await ProductService.updateProduct(update);
      const updatedProduct = ProductService.revisionToResponse(updatedRevision);
      validateProductProperties(updatedProduct, update);

      const containerEntity = await Container.findOne({ where: { id: containerRev.containerId } });
      expect(containerEntity.currentRevision).to.be.eq(2);

      const productInContainer = (await ContainerRevision.findOne({ where: { revision: 2, container: { id: containerRev.containerId } }, relations: {
        container: true,

        products: {
          category: true,
        },
      } })).products[0];
      expect(productInContainer.name).to.eq(update.name);
      expect(typeof productInContainer.alcoholPercentage === 'string'
        ? parseInt(productInContainer.alcoholPercentage, 10)
        : productInContainer.alcoholPercentage).to.eq(update.alcoholPercentage);
      expect(productInContainer.priceInclVat.getAmount()).to.eq(update.priceInclVat.amount);
      expect(productInContainer.category.id).to.eq(update.category);

      // Cleanup
      await ContainerRevision.delete({ containerId: containerRev.containerId });
      await Container.delete({ id: containerRev.containerId });
      await ProductRevision.delete({ productId: product.id });
      await Product.delete({ id: product.id });
    });
    it('should propagate the update to all POS', async () => {
      const ownerId = (await User.findOne({ where: { deleted: false } })).id;
      const createProduct: CreateProductParams = {
        alcoholPercentage: 0,
        category: 1,
        vat: 1,
        name: 'New Product Name',
        ownerId,
        featured: true,
        preferred: false,
        priceList: true,
        priceInclVat: {
          amount: 50,
          currency: 'EUR',
          precision: 2,
        },
      };

      const productRevision = await ProductService.createProduct(createProduct);
      const product = ProductService.revisionToResponse(productRevision);

      const createContainer: CreateContainerParams = {
        name: 'Container Name',
        ownerId,
        products: [product.id],
        public: true,
      };

      const containerRev = await ContainerService.createContainer(createContainer);

      const createPOS: CreatePointOfSaleParams = {
        containers: [containerRev.containerId],
        name: 'POS Name',
        useAuthentication: true,
        ownerId,
      };

      const pos = await PointOfSaleService.createPointOfSale(createPOS);

      const productUpdate: UpdateProductParams = {
        alcoholPercentage: 1,
        category: 2,
        vat: 1,
        id: product.id,
        name: 'New Product Name 2',
        featured: true,
        preferred: false,
        priceList: true,
        priceInclVat: {
          amount: 55,
          currency: 'EUR',
          precision: 2,
        },
      };

      await ProductService.updateProduct(productUpdate);
      const productFromPos = (await PointOfSaleRevision.findOne({ where: { revision: 2, pointOfSale: { id: pos.pointOfSaleId } }, relations: {
        pointOfSale: true,

        containers: {
          products: {
            category: true,
          },
        },
      } })).containers[0].products[0];

      expect(productFromPos.name).to.eq(productUpdate.name);
      expect(productFromPos.category.id).to.eq(productUpdate.category);
      expect(productFromPos.name).to.eq(productUpdate.name);
      expect(productFromPos.priceInclVat.getAmount()).to.eq(productUpdate.priceInclVat.amount);

      // Cleanup
      await PointOfSaleRevision.delete({ pointOfSaleId: pos.pointOfSaleId });
      await PointOfSale.delete({ id: pos.pointOfSaleId });
      await ContainerRevision.delete({ containerId: containerRev.containerId });
      await Container.delete({ id: containerRev.containerId });
      await ProductRevision.delete({ productId: product.id });
      await Product.delete({ id: product.id });
    });
  });

  describe('deleteProduct function', () => {
    it('should soft delete product and propagate to containers', async () => {
      const stub = sinon.stub(ContainerService, 'updateContainer').callsFake(async (params): Promise<ContainerRevision> => {
        const [revisions] = await ContainerService.getContainers({ containerId: params.id, returnProducts: true });
        return revisions[0];
      });

      const start = Math.floor(new Date().getTime() / 1000) * 1000;
      const product = ctx.products[0];
      let dbProduct = await Product.findOne({ where: { id: product.id }, withDeleted: true });
      // Sanity check
      expect(dbProduct).to.not.be.null;
      expect(dbProduct.deletedAt).to.be.null;

      await ProductService.deleteProduct(product.id);

      dbProduct = await Product.findOne({ where: { id: product.id }, withDeleted: true });
      expect(dbProduct).to.not.be.null;
      expect(dbProduct.deletedAt).to.not.be.null;
      expect(dbProduct.deletedAt.getTime()).to.be.greaterThanOrEqual(start);

      const deletedProducts = await Product.find({ where: { deletedAt: Not(IsNull()) }, withDeleted: true });
      expect(deletedProducts.length).to.equal(ctx.deletedProducts.length + 1);

      // Propagated update
      // Read from the database, as earlier tests may have updated this product after seeding
      const containerRevisions = (await ContainerRevision.find({ relations: { products: true }, withDeleted: true }))
        .filter((c) => c.products.some((p) => p.productId === product.id && p.revision === dbProduct.currentRevision))
        .filter((c) => c.container.deletedAt == null)
        .filter((c) => c.revision === c.container.currentRevision);
      expect(stub.callCount).to.be.greaterThan(0);
      expect(stub.callCount).to.equal(containerRevisions.length);
      for (let i = 0; i < stub.callCount; i += 1) {
        const call = stub.getCall(i);
        const container = containerRevisions[i];
        expect(call.args).to.deep.equalInAnyOrder([{
          id: container.containerId,
          name: container.name,
          public: container.container.public,
          products: container.products
            .filter((p) => p.productId !== product.id)
            .map((p) => p.productId),
        }]);
      }
      // Revert state
      await dbProduct.recover();
      stub.restore();
    });
    it('should throw error for non existent product', async () => {
      const productId = ctx.products.length + ctx.deletedProducts.length + 2;
      let dbProduct = await Product.findOne({ where: { id: productId }, withDeleted: true });
      // Sanity check
      expect(dbProduct).to.be.null;

      await expect(ProductService.deleteProduct(productId)).to.eventually.be.rejectedWith('Product not found!');

      const deletedProducts = await Product.find({ where: { deletedAt: Not(IsNull()) }, withDeleted: true });
      expect(deletedProducts.length).to.equal(ctx.deletedProducts.length);
    });
    it('should throw error when soft deleting product twice', async () => {
      const product = ctx.products[0];
      let dbProduct = await Product.findOne({ where: { id: product.id }, withDeleted: true });
      // Sanity check
      expect(dbProduct).to.not.be.null;
      expect(dbProduct.deletedAt).to.be.null;

      await ProductService.deleteProduct(product.id);

      dbProduct = await Product.findOne({ where: { id: product.id }, withDeleted: true });
      expect(dbProduct).to.not.be.null;
      expect(dbProduct.deletedAt).to.not.be.null;

      await expect(ProductService.deleteProduct(product.id)).to.eventually.be.rejectedWith('Product not found!');

      // Revert state
      await dbProduct.recover();
    });
  });
});
