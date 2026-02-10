/**
 * Squared Graphics Library (SGL)
 * All rendering logic lives here.
 */

export const sgl = {
    /**
     * Placeholder for opening a new tab for code/graphics
     */
    openOutputTab: (title, content) => {
        console.log("SGL: Placeholder for opening new tab for: " + title);
        // Logic to open a new window could go here
        // const win = window.open("", "_blank");
        // win.document.write(content);
    },

    createCanvas: (width = 400, height = 400) => {
        // Find existing or create new
        let canvas = document.getElementById('sgl-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'sgl-canvas';
            canvas.style.display = 'block';
            canvas.style.margin = '10px auto';
            canvas.style.border = '2px solid #FFB74D';
            canvas.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            // Append to console or body
            document.getElementById('console-output').appendChild(canvas);
        }
        canvas.width = width;
        canvas.height = height;
        
        return {
            element: canvas,
            ctx: canvas.getContext('2d'),
            width,
            height
        };
    },

    rect: (g, x, y, w, h, color) => {
        if (!g || !g.ctx) return;
        g.ctx.fillStyle = color || '#ffffff';
        g.ctx.fillRect(x, y, w, h);
    },

    clear: (g, color = '#000000') => {
        if (!g || !g.ctx) return;
        g.ctx.fillStyle = color;
        g.ctx.fillRect(0, 0, g.width, g.height);
    },

    text: (g, str, x, y, color = '#fff') => {
        if (!g || !g.ctx) return;
        g.ctx.fillStyle = color;
        g.ctx.font = '16px monospace';
        g.ctx.fillText(str, x, y);
    }
};

export default sgl;