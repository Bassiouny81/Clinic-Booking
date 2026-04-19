import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
export function requireAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    next();
}
export function requireRole(...roles) {
    return async (req, res, next) => {
        if (!req.isAuthenticated()) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, req.user.id));
        if (!user) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        const userRole = user.role;
        if (!roles.includes(userRole)) {
            res.status(403).json({ error: "Insufficient permissions" });
            return;
        }
        next();
    };
}
