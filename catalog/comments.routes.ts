import express, {Request, Response, Router} from 'express'
import {Comment} from './comments.model'
import passport from '../middleware/passport'
import jwt from 'jsonwebtoken'
import _ from 'lodash'

export const router = Router()

async function getCommentCheckEditable(req: Request, res: Response) {
    try {
        const comment = await Comment.findByPk(req.params.id)
        if (!comment) {
            res.status(404)
            throw new Error('Comment doesn\'t exists')
        }
        if (!_.isEqual(comment.UserId, req.user?.id) && req.user?.role !== 'admin') {
            res.status(403)
            throw new Error('Forbidden')
        }
        return comment
    } catch (e: any) {
        throw e
    }
}

router.get('/', async (req, res) => {
    const comments = await Comment.findAll()
    res.status(200).json(comments)
})

router.get('/:id', async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id)
        if (!comment) {
            res.status(404).json({message: 'Comment does not exist'})
            return
        }
        res.status(200).json(comment)
    } catch (e: any) {
        res.status(404).json(e.message)
    }
})

router.post('/', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const UserId = req.user!.id
            const {text, rating, ProductId} = req.body
            const comment = await Comment.create({text, rating, UserId, ProductId})
            res.status(201).json(comment)
        } catch (e: any) {
            res.status(404).json(e.message)
        }
    })

router.patch('/:id', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const comment = await getCommentCheckEditable(req, res)
            comment.set(req.body)
            await comment.save()
            res.status(200).json(comment)
        } catch (e: any) {
            if (!res.status) {
                res.status(500)
            }
            res.json(e.message)
        }
    })

router.delete('/:id', passport.authenticate('jwt', {session: false}),
    async (req, res) => {
        try {
            const comment = await getCommentCheckEditable(req, res)
            await comment.destroy()
            res.status(200).json({deleted: comment.id})
        } catch (e: any) {
            if (!res.status) {
                res.status(500)
            }
            res.json(e.message)
        }
    })