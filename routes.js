const express = require('express');
const multer = require('multer');
const { GridFSBucket, ObjectID } = require('mongodb');
const GridFsStorage = require('multer-gridfs-storage');

const { dbReady } = require('./connection');
const db = dbReady().then(client => client.db('nextapp'));
const client = dbReady();

/* eslint-disable-next-line new-cap */
const router = express.Router();
const storage = new GridFsStorage({ db, client });
const upload = multer({ storage });

router.post('/profile', upload.single('file'), async (req, res) => {
	if (req.body && req.body.oldAvatar) {
		try {
			const bucket = new GridFSBucket(storage.db);
			await bucket.delete(new ObjectID(req.body.oldAvatar));
			console.log('delete old file!!!');
		} catch (err) {
			// catch error case postgresql have id but in mongodb that ID is not existed
			console.log('cannot delete old file because =>>>', err);
		}

	}
	res.status(200).json(req.file);
});

router.get('/profile/:id', (req, res) => {
	const bucket = new GridFSBucket(storage.db);
	const stream = bucket.openDownloadStream(new ObjectID(req.params.id));
	stream.on('error', err => {
		if (err.code === 'ENOENT') {
			res.status(404).send('File not found');
			return;
		}

		res.status(500).send(err.message);
	});
	stream.pipe(res);
});

router.delete('/profile/:id', (req, res) => {
	const bucket = new GridFSBucket(storage.db);
	bucket.delete(new ObjectID(req.params.id), err => {
		if (err) {
			if (err.message.startsWith('FileNotFound')) {
				res.status(404).send('File not found');
				return;
			}

			return res.status(500).send(err);
		}

		res.status(204).send('File deleted');
	});
});

module.exports = router;
