import { Router, RequestHandler } from 'express';
import { AdminService } from '../services';

const router = Router();
const adminService = AdminService.getInstance();

// User Management Routes
/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     description: Returns a list of all registered users (without sensitive data)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       500:
 *         description: Server error
 */
const handleListUsers: RequestHandler = async (req, res, next) => {
    try {
        const users = await adminService.listUsers();
        res.json(users);
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ error: 'Failed to list users' });
    }
};

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns a specific user by their ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const handleGetUser: RequestHandler = async (req, res, next) => {
    try {
        const user = await adminService.getUser(req.params.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
};

// Media Management Routes
/**
 * @swagger
 * /api/admin/media/{bucket}:
 *   get:
 *     summary: List media in bucket
 *     description: Returns a list of all media items in a specific bucket
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of media items retrieved successfully
 *       500:
 *         description: Server error
 */
const handleListMedia: RequestHandler = async (req, res, next) => {
    try {
        const { bucket } = req.params;
        const { userId } = req.query;
        const media = await adminService.listMedia(bucket, userId as string);
        res.json(media);
    } catch (error) {
        console.error('List media error:', error);
        res.status(500).json({ error: 'Failed to list media' });
    }
};

/**
 * @swagger
 * /api/admin/media/{bucket}/{id}:
 *   get:
 *     summary: Get media by ID
 *     description: Returns a specific media item by its ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media item retrieved successfully
 *       404:
 *         description: Media not found
 *       500:
 *         description: Server error
 */
const handleGetMedia: RequestHandler = async (req, res, next) => {
    try {
        const { bucket, id } = req.params;
        const media = await adminService.getMedia(id, bucket);
        res.json(media);
    } catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({ error: 'Failed to get media' });
    }
};

/**
 * @swagger
 * /api/admin/media/{bucket}/{id}:
 *   delete:
 *     summary: Delete media
 *     description: Deletes a specific media item
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media deleted successfully
 *       404:
 *         description: Media not found
 *       500:
 *         description: Server error
 */
const handleDeleteMedia: RequestHandler = async (req, res, next) => {
    try {
        const { bucket, id } = req.params;
        await adminService.deleteMedia(id, bucket);
        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Delete media error:', error);
        res.status(500).json({ error: 'Failed to delete media' });
    }
};

// Video User Associations Management Routes
/**
 * @swagger
 * /api/admin/associations/{userId}:
 *   get:
 *     summary: List video user associations
 *     description: Returns all video associations for a specific user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of associations retrieved successfully
 *       500:
 *         description: Server error
 */
const handleListAssociations: RequestHandler = async (req, res, next) => {
    try {
        const associations = await adminService.listVideoUserAssociations(req.params.userId);
        res.json(associations);
    } catch (error) {
        console.error('List associations error:', error);
        res.status(500).json({ error: 'Failed to list associations' });
    }
};

/**
 * @swagger
 * /api/admin/associations:
 *   post:
 *     summary: Create video user association
 *     description: Creates a new association between a video and a user
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoId
 *               - userId
 *             properties:
 *               videoId:
 *                 type: string
 *               userId:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Association created successfully
 *       500:
 *         description: Server error
 */
const handleCreateAssociation: RequestHandler = async (req, res, next) => {
    try {
        const { videoId, userId, metadata } = req.body;
        const id = await adminService.createVideoUserAssociation(videoId, userId, metadata);
        res.status(201).json({ id });
    } catch (error) {
        console.error('Create association error:', error);
        res.status(500).json({ error: 'Failed to create association' });
    }
};

/**
 * @swagger
 * /api/admin/associations:
 *   delete:
 *     summary: Delete video user association
 *     description: Deletes an association between a video and a user
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoId
 *               - userId
 *             properties:
 *               videoId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Association deleted successfully
 *       500:
 *         description: Server error
 */
const handleDeleteAssociation: RequestHandler = async (req, res, next) => {
    try {
        const { videoId, userId } = req.body;
        await adminService.deleteVideoUserAssociation(userId, videoId);
        res.json({ message: 'Association deleted successfully' });
    } catch (error) {
        console.error('Delete association error:', error);
        res.status(500).json({ error: 'Failed to delete association' });
    }
};

// Operations Management Routes
/**
 * @swagger
 * /api/admin/operations/{id}:
 *   get:
 *     summary: Get operation by ID
 *     description: Returns a specific operation by its ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operation retrieved successfully
 *       404:
 *         description: Operation not found
 *       500:
 *         description: Server error
 */
const handleGetOperation: RequestHandler = async (req, res, next) => {
    try {
        const operation = await adminService.getOperation(req.params.id);
        if (!operation) {
            res.status(404).json({ error: 'Operation not found' });
            return;
        }
        res.json(operation);
    } catch (error) {
        console.error('Get operation error:', error);
        res.status(500).json({ error: 'Failed to get operation' });
    }
};

/**
 * @swagger
 * /api/admin/operations:
 *   post:
 *     summary: Create operation
 *     description: Creates a new operation
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Operation created successfully
 *       500:
 *         description: Server error
 */
const handleCreateOperation: RequestHandler = async (req, res, next) => {
    try {
        const { userId, type, metadata } = req.body;
        const id = await adminService.createOperation(userId, type, metadata);
        res.status(201).json({ id });
    } catch (error) {
        console.error('Create operation error:', error);
        res.status(500).json({ error: 'Failed to create operation' });
    }
};

/**
 * @swagger
 * /api/admin/operations/{id}/status:
 *   put:
 *     summary: Update operation status
 *     description: Updates the status of a specific operation
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Operation status updated successfully
 *       404:
 *         description: Operation not found
 *       500:
 *         description: Server error
 */
const handleUpdateOperationStatus: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, metadata } = req.body;
        const operation = await adminService.updateOperationStatus(id, status, metadata);
        res.json(operation);
    } catch (error) {
        console.error('Update operation status error:', error);
        res.status(500).json({ error: 'Failed to update operation status' });
    }
};

/**
 * @swagger
 * /api/admin/operations:
 *   get:
 *     summary: List all operations
 *     description: Returns a list of all operations
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of operations
 *       500:
 *         description: Server error
 */
const handleListOperations: RequestHandler = async (req, res, next) => {
    try {
        const operations = await adminService.listOperations();
        res.json(operations);
    } catch (error) {
        console.error('List operations error:', error);
        res.status(500).json({ error: 'Failed to list operations' });
    }
};

/**
 * @swagger
 * /api/admin/operations/{id}:
 *   delete:
 *     summary: Delete operation
 *     description: Deletes a specific operation by its ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Operation deleted successfully
 *       404:
 *         description: Operation not found
 *       500:
 *         description: Server error
 */
const handleDeleteOperation: RequestHandler = async (req, res, next) => {
    try {
        await adminService.deleteOperation(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Delete operation error:', error);
        res.status(500).json({ error: 'Failed to delete operation' });
    }
};

// Register routes
router.get('/users', handleListUsers);
router.get('/users/:id', handleGetUser);

router.get('/media/:bucket', handleListMedia);
router.get('/media/:bucket/:id', handleGetMedia);
router.delete('/media/:bucket/:id', handleDeleteMedia);

router.get('/associations/:userId', handleListAssociations);
router.post('/associations', handleCreateAssociation);
router.delete('/associations', handleDeleteAssociation);

router.get('/operations/:id', handleGetOperation);
router.post('/operations', handleCreateOperation);
router.put('/operations/:id/status', handleUpdateOperationStatus);
router.get('/operations', handleListOperations);
router.delete('/operations/:id', handleDeleteOperation);

export default router; 