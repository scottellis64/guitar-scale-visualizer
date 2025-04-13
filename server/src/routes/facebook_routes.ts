import { Router } from 'express';
import axios from 'axios';
import { FacebookReel, DownloadReelRequest } from '../types/facebook';

const router = Router();

// Facebook API Configuration
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const FB_REDIRECT_URI = process.env.FB_REDIRECT_URI || 'http://localhost:3001/auth/facebook/callback';
const FB_API_URL = 'https://graph.facebook.com/v18.0';

// In-memory storage for access tokens (replace with database in production)
let userAccessTokens: { [key: string]: string } = {};

// In-memory storage for reels (replace with database in production)
let reels: FacebookReel[] = [];

// Middleware to check Facebook authentication
const checkFacebookAuth = async (req: any, res: any, next: any) => {
    const userId = req.headers['x-facebook-user-id'] as string;
    const accessToken = userAccessTokens[userId];

    if (!accessToken) {
        return res.status(401).json({ error: 'Facebook authentication required' });
    }

    // Verify token is still valid
    try {
        await axios.get(`${FB_API_URL}/me`, {
            params: { access_token: accessToken }
        });
        next();
    } catch (error) {
        delete userAccessTokens[userId];
        res.status(401).json({ error: 'Invalid or expired Facebook token' });
    }
};

router.get('/reels', checkFacebookAuth, async (req, res) => {
    try {
        const { downloaded, sortBy = 'createdAt', order = 'desc' } = req.query;
        const userId = req.headers['x-facebook-user-id'] as string;
        console.log('Fetching reels for user:', userId);
        
        const accessToken = userAccessTokens[userId];
        if (!accessToken) {
            console.error('No access token found for user:', userId);
            return res.status(401).json({ error: 'Facebook authentication required' });
        }

        // Fetch reels from Facebook Graph API
        console.log('Making request to Facebook Graph API...');
        const response = await axios.get(`${FB_API_URL}/me/videos`, {
            params: {
                access_token: accessToken,
                fields: 'id,title,created_time,permalink_url,source',
                limit: 50
            }
        });

        console.log('Successfully fetched videos from Facebook');
        let reels: FacebookReel[] = response.data.data.map((video: any) => ({
            id: video.id,
            title: video.title || 'Untitled Reel',
            url: video.permalink_url,
            downloaded: false,
            createdAt: video.created_time
        }));
        
        console.log(`Found ${reels.length} reels`);
        
        // Filter by download status if specified
        if (downloaded !== undefined) {
            reels = reels.filter(reel => 
                reel.downloaded === (downloaded === 'true')
            );
        }
        
        // Sort reels
        const sortableFields: (keyof FacebookReel)[] = ['id', 'title', 'createdAt'];
        if (sortableFields.includes(sortBy as keyof FacebookReel)) {
            reels.sort((a, b) => {
                const aValue = a[sortBy as keyof FacebookReel];
                const bValue = b[sortBy as keyof FacebookReel];
                
                if (order === 'desc') {
                    return String(bValue).localeCompare(String(aValue));
                }
                return String(aValue).localeCompare(String(bValue));
            });
        }
        
        res.json({ data: reels });
    } catch (error) {
        console.error('Error fetching Facebook reels:', error);
        res.status(500).json({ error: 'Failed to fetch reels from Facebook' });
    }
});

router.post('/reels/download', async (req, res) => {
    try {
        const { url, title }: DownloadReelRequest = req.body;
        
        // TODO: Implement actual download logic using a library like ytdl-core
        // For now, we'll just create a mock reel
        const newReel: FacebookReel = {
            id: Date.now().toString(),
            title: title || 'Untitled Reel',
            url,
            downloaded: false,
            createdAt: new Date().toISOString()
        };

        reels.push(newReel);
        res.json({ data: newReel });
    } catch (error) {
        res.status(500).json({ error: 'Failed to download reel' });
    }
});

router.get('/auth', (_req, res) => {
    console.log('Starting Facebook login flow...');
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${FB_REDIRECT_URI}&scope=user_videos`;
    res.redirect(authUrl);
});

router.get('/auth/callback', async (req, res) => {
    try {
        const { code } = req.query;
        console.log('Received Facebook callback with code:', code);
        
        if (!code) {
            return res.status(400).json({ error: 'Authorization code not provided' });
        }

        // Exchange code for access token
        const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
            params: {
                client_id: FB_APP_ID,
                client_secret: FB_APP_SECRET,
                redirect_uri: FB_REDIRECT_URI,
                code
            }
        });

        const { access_token, user_id } = tokenResponse.data;
        console.log('Successfully obtained access token for user:', user_id);
        
        // Store the access token (in production, use a database)
        userAccessTokens[user_id] = access_token;

        // Redirect to frontend with success message and user ID
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?auth=success&userId=${user_id}`);
    } catch (error) {
        console.error('Facebook auth error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?auth=error`);
    }
});

export default router; 